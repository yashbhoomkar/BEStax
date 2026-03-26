import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import EditableTable from "../components/EditableTable";
import { api } from "../lib/api";
import { computeProjectScore, createBlankRow, normalizeRows } from "../lib/helpers";

function ProjectCreatePage() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [evaluators, setEvaluators] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedEvaluatorNames, setSelectedEvaluatorNames] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [datasetPreview, setDatasetPreview] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isEvaluated, setIsEvaluated] = useState(false);

  useEffect(() => {
    async function loadDependencies() {
      try {
        const [datasetData, evaluatorData] = await Promise.all([
          api.listDatasets(),
          api.listEvaluators()
        ]);
        setDatasets(datasetData);
        setEvaluators(evaluatorData);
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      }
    }

    loadDependencies();
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) {
      setDatasetPreview(null);
      setIsEvaluated(false);
      return;
    }

    const dataset = datasets.find((item) => item.id === selectedDatasetId);
    if (!dataset) {
      return;
    }

    setDatasetPreview({
      name: dataset.name,
      description: dataset.description,
      databaseName: dataset.databaseName,
      databaseType: dataset.databaseType,
      columns: [...dataset.columns],
      rows: normalizeRows(dataset.rows || [], dataset.columns || [])
    });
    setIsEvaluated(false);
  }, [selectedDatasetId, datasets]);

  function updatePreviewRow(rowIndex, column, value) {
    setDatasetPreview((current) => {
      const nextRows = current.rows.map((row, index) =>
        index === rowIndex ? { ...row, [column]: value } : row
      );
      return { ...current, rows: nextRows };
    });
  }

  function addPreviewRow() {
    setDatasetPreview((current) => ({
      ...current,
      rows: [...current.rows, createBlankRow(current.columns)]
    }));
  }

  function addPreviewColumn() {
    const columnName = window.prompt("Enter the new column name");
    if (!columnName?.trim()) {
      return;
    }

    setDatasetPreview((current) => {
      if (current.columns.includes(columnName)) {
        return current;
      }
      const nextColumns = [...current.columns, columnName];
      const nextRows = current.rows.map((row) => ({ ...row, [columnName]: "" }));
      return { ...current, columns: nextColumns, rows: nextRows };
    });
  }

  async function handleEvaluate() {
    try {
      if (!datasetPreview) {
        setStatus({ type: "error", message: "Select a dataset first." });
        return;
      }
      if (selectedEvaluatorNames.length === 0) {
        setStatus({ type: "error", message: "Select at least one evaluator." });
        return;
      }

      const result = await api.runEvaluation({
        datasetSnapshot: datasetPreview,
        evaluatorNames: selectedEvaluatorNames
      });
      setDatasetPreview(result.datasetSnapshot);
      setSelectedEvaluatorNames(result.evaluatorNames);
      setIsEvaluated(true);
      setStatus({ type: "success", message: "Evaluation completed successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleSaveProject() {
    try {
      if (!projectName.trim()) {
        setStatus({ type: "error", message: "Project name is required." });
        return;
      }
      if (!datasetPreview) {
        setStatus({ type: "error", message: "Dataset preview is required." });
        return;
      }

      const payload = {
        name: projectName,
        description: projectDescription,
        datasetName: datasetPreview.name,
        score: computeProjectScore(datasetPreview.rows, selectedEvaluatorNames),
        lastUpdated: new Date().toISOString().slice(0, 10),
        evaluatorNames: selectedEvaluatorNames,
        datasetSnapshot: datasetPreview
      };

      const project = await api.createProject(payload);
      navigate(`/projects/${project.id}`);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <div>
      <PageHeader
        title="Create Project"
        description="Import a dataset, select evaluators, run evaluation, and save the project."
      />
      <StatusBanner type={status.type} message={status.message} />

      <div className="form-grid">
        <label>
          Project Name
          <input value={projectName} onChange={(event) => setProjectName(event.target.value)} />
        </label>
        <label>
          Import Dataset
          <select
            value={selectedDatasetId}
            onChange={(event) => setSelectedDatasetId(event.target.value)}
          >
            <option value="">Select dataset</option>
            {datasets.map((dataset) => (
              <option value={dataset.id} key={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block-field">
        Project Description
        <textarea
          value={projectDescription}
          onChange={(event) => setProjectDescription(event.target.value)}
          rows={4}
        />
      </label>

      <div className="section-panel">
        <h3>Select Evaluators</h3>
        <label className="block-field">
          Evaluator Dropdown
          <select
            multiple
            className="multi-select"
            value={selectedEvaluatorNames}
            onChange={(event) => {
              const values = Array.from(event.target.selectedOptions, (option) => option.value);
              setSelectedEvaluatorNames(values);
              setIsEvaluated(false);
            }}
          >
            {evaluators.map((evaluator) => (
              <option key={evaluator.id} value={evaluator.name}>
                {evaluator.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {datasetPreview ? (
        <div className="section-panel">
          <div className="section-header-inline">
            <div>
              <h3>Imported Dataset</h3>
              <p>
                {datasetPreview.name} | {datasetPreview.databaseName} |{" "}
                {datasetPreview.databaseType}
              </p>
            </div>
            <button onClick={handleEvaluate}>Evaluate</button>
          </div>
          <EditableTable
            columns={datasetPreview.columns}
            rows={datasetPreview.rows}
            onCellChange={updatePreviewRow}
            onAddRow={addPreviewRow}
            onAddColumn={addPreviewColumn}
          />
          {isEvaluated ? (
            <div className="top-gap">
              <button onClick={handleSaveProject}>Save Project</button>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default ProjectCreatePage;
