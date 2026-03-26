const { MANDATORY_DATASET_COLUMNS } = require("../constants/defaults");
const Dataset = require("../models/Dataset");
const Evaluator = require("../models/Evaluator");
const Project = require("../models/Project");
const { callProvider, normalizeProviderName } = require("./providerService");
const AppError = require("../utils/appError");
const { serializeDocument } = require("../utils/serialize");

function stripCodeFences(text) {
  const cleaned = String(text || "").trim();
  if (!cleaned.startsWith("```")) {
    return cleaned;
  }

  const lines = cleaned.split("\n");
  const withoutFirst = lines.slice(1);
  if (withoutFirst[withoutFirst.length - 1]?.trim() === "```") {
    withoutFirst.pop();
  }
  return withoutFirst.join("\n").trim();
}

function parseBatchResults(responseText, batchSize) {
  const parsed = JSON.parse(stripCodeFences(responseText));
  if (!Array.isArray(parsed)) {
    throw new AppError(502, "Provider must return a JSON array of evaluator results.");
  }
  if (parsed.length !== batchSize) {
    throw new AppError(502, "Provider returned a different number of results than the batch size.");
  }
  return parsed;
}

function normalizeEvaluatorResult(result) {
  if (result && typeof result === "object" && !Array.isArray(result)) {
    if (Object.prototype.hasOwnProperty.call(result, "score")) {
      return String(result.score);
    }
    return JSON.stringify(result);
  }
  if (Array.isArray(result)) {
    return JSON.stringify(result);
  }
  return String(result ?? "");
}

function computeProjectScore(rows, evaluatorNames) {
  const numericScores = [];
  for (const row of rows) {
    for (const evaluatorName of evaluatorNames) {
      const value = Number(row[evaluatorName]);
      if (!Number.isNaN(value)) {
        numericScores.push(value);
      }
    }
  }

  if (numericScores.length === 0) {
    return "";
  }

  const average = numericScores.reduce((sum, value) => sum + value, 0) / numericScores.length;
  return average.toFixed(2);
}

function normalizeRowsForColumns(rows, columns) {
  return rows.map((row) => {
    const nextRow = {};
    for (const column of columns) {
      nextRow[column] = row && row[column] != null ? String(row[column]) : "";
    }
    return nextRow;
  });
}

function buildPrompt(evaluator, payloadRows) {
  return `
You are evaluating SQL generation rows in batches.
Use the evaluator system prompt and the scoring range strictly.

Evaluator Name: ${evaluator.name}
Evaluator System Prompt: ${evaluator.systemPrompt || ""}
Evaluator Range: ${evaluator.range || ""}

Generic instructions:
- Evaluate each row independently.
- Return only valid JSON. Do not add explanations, markdown fences, or any text outside the JSON array.
- The output must be a JSON array with exactly ${payloadRows.length} objects.
- Each object must have:
  - row_index
  - result
- Preserve the input row_index values.
- Put only the evaluator outcome in the result field.
- Prefer returning a numeric score directly in result when possible.
- If you need structured output, use {"score": value} only.
- Valid example shape:
  [{"row_index": 0, "result": 1}, {"row_index": 1, "result": {"score": 1}}]

Rows to evaluate:
${JSON.stringify(payloadRows, null, 2)}
`.trim();
}

async function resolveDatasetSnapshot({ datasetId, datasetSnapshot }) {
  if (datasetSnapshot) {
    return {
      name: datasetSnapshot.name || "",
      description: datasetSnapshot.description || "",
      databaseName: datasetSnapshot.databaseName || "",
      databaseType: datasetSnapshot.databaseType || "",
      columns: Array.isArray(datasetSnapshot.columns) ? datasetSnapshot.columns.map(String) : [],
      rows: Array.isArray(datasetSnapshot.rows) ? datasetSnapshot.rows : []
    };
  }

  if (!datasetId) {
    throw new AppError(400, "datasetId or datasetSnapshot is required.");
  }

  const dataset = await Dataset.findById(datasetId);
  if (!dataset) {
    throw new AppError(404, "Dataset not found.");
  }

  const serialized = serializeDocument(dataset);
  return {
    name: serialized.name,
    description: serialized.description,
    databaseName: serialized.databaseName,
    databaseType: serialized.databaseType,
    columns: serialized.columns,
    rows: serialized.rows
  };
}

async function resolveEvaluators({ evaluatorIds, evaluatorNames }) {
  if (Array.isArray(evaluatorIds) && evaluatorIds.length > 0) {
    const evaluators = await Evaluator.find({ _id: { $in: evaluatorIds } });
    if (evaluators.length === 0) {
      throw new AppError(404, "No evaluators found.");
    }
    return evaluators.map(serializeDocument);
  }

  if (Array.isArray(evaluatorNames) && evaluatorNames.length > 0) {
    const evaluators = await Evaluator.find({ name: { $in: evaluatorNames } });
    if (evaluators.length === 0) {
      throw new AppError(404, "No evaluators found.");
    }
    return evaluators.map(serializeDocument);
  }

  throw new AppError(400, "At least one evaluator must be selected.");
}

async function evaluateSnapshot(datasetSnapshot, evaluators) {
  const columns = Array.isArray(datasetSnapshot.columns) ? [...datasetSnapshot.columns] : [];
  const missingMandatoryColumns = MANDATORY_DATASET_COLUMNS.filter((column) => !columns.includes(column));
  if (missingMandatoryColumns.length > 0) {
    throw new AppError(400, "Dataset snapshot is missing mandatory columns.", {
      missingColumns: missingMandatoryColumns
    });
  }

  let rows = normalizeRowsForColumns(datasetSnapshot.rows || [], columns);

  for (const evaluator of evaluators) {
    const evaluatorName = evaluator.name;
    if (!columns.includes(evaluatorName)) {
      columns.push(evaluatorName);
    }

    const pendingIndices = rows
      .map((row, index) => ({ row, index }))
      .filter(({ row }) => String(row[evaluatorName] || "").trim() === "")
      .map(({ index }) => index);

    for (let batchStart = 0; batchStart < pendingIndices.length; batchStart += 20) {
      const batchIndices = pendingIndices.slice(batchStart, batchStart + 20);
      const payloadRows = batchIndices.map((rowIndex, payloadIndex) => ({
        row_index: payloadIndex,
        user_prompt: rows[rowIndex]["User Prompt"] || "",
        generated_query: rows[rowIndex]["Generated Query"] || "",
        expected_query: rows[rowIndex]["Expected Query"] || ""
      }));

      const providerName = normalizeProviderName(evaluator.currentModel);
      const responseText = await callProvider(providerName, buildPrompt(evaluator, payloadRows));
      const parsedResults = parseBatchResults(responseText, payloadRows.length);

      for (const parsedResult of parsedResults) {
        const rowIndex = parsedResult.row_index;
        if (!Number.isInteger(rowIndex) || rowIndex < 0 || rowIndex >= batchIndices.length) {
          throw new AppError(502, "Provider returned an invalid row_index.");
        }
        const targetRowIndex = batchIndices[rowIndex];
        rows[targetRowIndex][evaluatorName] = normalizeEvaluatorResult(parsedResult.result);
      }
    }
  }

  rows = normalizeRowsForColumns(rows, columns);
  const evaluatorNames = evaluators.map((evaluator) => evaluator.name);

  return {
    datasetSnapshot: {
      name: datasetSnapshot.name || "",
      description: datasetSnapshot.description || "",
      databaseName: datasetSnapshot.databaseName || "",
      databaseType: datasetSnapshot.databaseType || "",
      columns,
      rows
    },
    evaluatorNames,
    score: computeProjectScore(rows, evaluatorNames),
    lastUpdated: new Date().toISOString().slice(0, 10)
  };
}

async function runEvaluation(payload) {
  const datasetSnapshot = await resolveDatasetSnapshot(payload);
  const evaluators = await resolveEvaluators(payload);
  return evaluateSnapshot(datasetSnapshot, evaluators);
}

async function reEvaluateProject(projectId) {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new AppError(404, "Project not found.");
  }

  const evaluatorNames = Array.isArray(project.evaluatorNames) ? project.evaluatorNames : [];
  const evaluators = await resolveEvaluators({ evaluatorNames });
  const result = await evaluateSnapshot(project.datasetSnapshot || {}, evaluators);

  project.score = result.score;
  project.lastUpdated = result.lastUpdated;
  project.evaluatorName = result.evaluatorNames.join(", ");
  project.evaluatorNames = result.evaluatorNames;
  project.datasetSnapshot = result.datasetSnapshot;
  await project.save();

  return serializeDocument(project);
}

module.exports = {
  runEvaluation,
  reEvaluateProject,
  computeProjectScore
};
