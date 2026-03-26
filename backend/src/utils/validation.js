const { MANDATORY_DATASET_COLUMNS } = require("../constants/defaults");
const AppError = require("./appError");

function ensureString(value, fieldName) {
  if (typeof value !== "string" || !value.trim()) {
    throw new AppError(400, `${fieldName} is required.`);
  }
  return value.trim();
}

function normalizeDatasetPayload(payload = {}) {
  const name = ensureString(payload.name, "Dataset name");
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const databaseName =
    typeof payload.databaseName === "string" ? payload.databaseName.trim() : "";
  const databaseType =
    typeof payload.databaseType === "string" ? payload.databaseType.trim() : "";
  const columns = Array.isArray(payload.columns) ? payload.columns.map(String) : [];
  const rows = Array.isArray(payload.rows) ? payload.rows : [];

  const missingColumns = MANDATORY_DATASET_COLUMNS.filter((column) => !columns.includes(column));
  if (missingColumns.length > 0) {
    throw new AppError(400, "Dataset is missing mandatory columns.", {
      missingColumns
    });
  }

  const normalizedRows = rows.map((row) => {
    const nextRow = {};
    for (const column of columns) {
      nextRow[column] = row && row[column] != null ? String(row[column]) : "";
    }
    return nextRow;
  });

  return {
    name,
    description,
    databaseName,
    databaseType,
    columns,
    rows: normalizedRows
  };
}

function normalizeEvaluatorPayload(payload = {}) {
  return {
    name: ensureString(payload.name, "Evaluator name"),
    description: typeof payload.description === "string" ? payload.description.trim() : "",
    range: typeof payload.range === "string" ? payload.range.trim() : "",
    databases: typeof payload.databases === "string" ? payload.databases.trim() : "",
    systemPrompt: typeof payload.systemPrompt === "string" ? payload.systemPrompt.trim() : "",
    currentModel: typeof payload.currentModel === "string" ? payload.currentModel.trim() : "Gemini"
  };
}

function normalizeApiKeyPayload(payload = {}) {
  return {
    apiName: ensureString(payload.apiName, "API name"),
    apiKey: typeof payload.apiKey === "string" ? payload.apiKey.trim() : ""
  };
}

function normalizeModelConfigPayload(payload = {}) {
  return {
    modelKey: ensureString(payload.modelKey, "Model key"),
    modelName: ensureString(payload.modelName, "Model name")
  };
}

function normalizeProjectPayload(payload = {}) {
  const name = ensureString(payload.name, "Project name");
  const datasetName = typeof payload.datasetName === "string" ? payload.datasetName.trim() : "";
  const description = typeof payload.description === "string" ? payload.description.trim() : "";
  const score = typeof payload.score === "string" ? payload.score.trim() : "";
  const lastUpdated = typeof payload.lastUpdated === "string" ? payload.lastUpdated.trim() : "";
  const evaluatorNames = Array.isArray(payload.evaluatorNames)
    ? payload.evaluatorNames.map(String)
    : [];
  const datasetSnapshot = payload.datasetSnapshot || {};

  return {
    name,
    datasetName,
    description,
    score,
    lastUpdated,
    evaluatorName: evaluatorNames.join(", "),
    evaluatorNames,
    datasetSnapshot: {
      name: typeof datasetSnapshot.name === "string" ? datasetSnapshot.name.trim() : datasetName,
      description:
        typeof datasetSnapshot.description === "string" ? datasetSnapshot.description.trim() : "",
      databaseName:
        typeof datasetSnapshot.databaseName === "string"
          ? datasetSnapshot.databaseName.trim()
          : "",
      databaseType:
        typeof datasetSnapshot.databaseType === "string"
          ? datasetSnapshot.databaseType.trim()
          : "",
      columns: Array.isArray(datasetSnapshot.columns)
        ? datasetSnapshot.columns.map(String)
        : [],
      rows: Array.isArray(datasetSnapshot.rows) ? datasetSnapshot.rows : []
    }
  };
}

module.exports = {
  normalizeDatasetPayload,
  normalizeEvaluatorPayload,
  normalizeApiKeyPayload,
  normalizeModelConfigPayload,
  normalizeProjectPayload
};
