import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import EditableTable from "../components/EditableTable";
import { api } from "../lib/api";
import { computeProjectScore, createBlankRow, normalizeRows } from "../lib/helpers";

function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [evaluators, setEvaluators] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

  async function loadProject() {
    try {
      setLoading(true);
      const [projectData, evaluatorData] = await Promise.all([
        api.getProject(projectId),
        api.listEvaluators()
      ]);
      projectData.datasetSnapshot = {
        ...projectData.datasetSnapshot,
        columns: [...(projectData.datasetSnapshot?.columns || [])],
        rows: normalizeRows(
          projectData.datasetSnapshot?.rows || [],
          projectData.datasetSnapshot?.columns || []
        )
      };
      projectData.evaluatorNames = projectData.evaluatorNames || [];
      setProject(projectData);
      setEvaluators(evaluatorData);
      setStatus({ type: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProject();
  }, [projectId]);

  function updateField(field, value) {
    setProject((current) => ({ ...current, [field]: value }));
  }

  function updateSnapshotField(field, value) {
    setProject((current) => ({
      ...current,
      datasetSnapshot: { ...current.datasetSnapshot, [field]: value }
    }));
  }

  function updateRow(rowIndex, column, value) {
    setProject((current) => ({
      ...current,
      datasetSnapshot: {
        ...current.datasetSnapshot,
        rows: current.datasetSnapshot.rows.map((row, index) =>
          index === rowIndex ? { ...row, [column]: value } : row
        )
      }
    }));
  }

  function addRow() {
    setProject((current) => ({
      ...current,
      datasetSnapshot: {
        ...current.datasetSnapshot,
        rows: [
          ...current.datasetSnapshot.rows,
          createBlankRow(current.datasetSnapshot.columns)
        ]
      }
    }));
  }

  function addColumn() {
    const columnName = window.prompt("Enter the new column name");
    if (!columnName?.trim()) {
      return;
    }
    setProject((current) => {
      if (current.datasetSnapshot.columns.includes(columnName)) {
        return current;
      }
      return {
        ...current,
        datasetSnapshot: {
          ...current.datasetSnapshot,
          columns: [...current.datasetSnapshot.columns, columnName],
          rows: current.datasetSnapshot.rows.map((row) => ({ ...row, [columnName]: "" }))
        }
      };
    });
  }

  async function handleSave() {
    try {
      const payload = {
        name: project.name,
        description: project.description,
        datasetName: project.datasetSnapshot.name,
        score: computeProjectScore(project.datasetSnapshot.rows, project.evaluatorNames),
        lastUpdated: new Date().toISOString().slice(0, 10),
        evaluatorNames: project.evaluatorNames,
        datasetSnapshot: project.datasetSnapshot
      };
      const updated = await api.updateProject(projectId, payload);
      updated.datasetSnapshot = {
        ...updated.datasetSnapshot,
        columns: [...(updated.datasetSnapshot?.columns || [])],
        rows: normalizeRows(
          updated.datasetSnapshot?.rows || [],
          updated.datasetSnapshot?.columns || []
        )
      };
      updated.evaluatorNames = updated.evaluatorNames || [];
      setProject(updated);
      setStatus({ type: "success", message: "Project updated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleReEvaluate() {
    try {
      const updated = await api.reEvaluateProject(projectId);
      updated.datasetSnapshot = {
        ...updated.datasetSnapshot,
        columns: [...(updated.datasetSnapshot?.columns || [])],
        rows: normalizeRows(
          updated.datasetSnapshot?.rows || [],
          updated.datasetSnapshot?.columns || []
        )
      };
      updated.evaluatorNames = updated.evaluatorNames || [];
      setProject(updated);
      setStatus({ type: "success", message: "Project re-evaluated successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  if (loading) {
    return <p>Loading project...</p>;
  }

  if (!project) {
    return <StatusBanner type="error" message={status.message || "Project not found."} />;
  }

  return (
    <div>
      <PageHeader
        title="Project Detail"
        description="Edit metadata, update the dataset snapshot, save changes, or re-evaluate."
      />
      <StatusBanner type={status.type} message={status.message} />

      <div className="form-grid">
        <label>
          Project Name
          <input value={project.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label>
          Dataset Name
          <input
            value={project.datasetSnapshot.name || ""}
            onChange={(event) => updateSnapshotField("name", event.target.value)}
          />
        </label>
        <label>
          Database Name
          <input
            value={project.datasetSnapshot.databaseName || ""}
            onChange={(event) => updateSnapshotField("databaseName", event.target.value)}
          />
        </label>
        <label>
          Database Type
          <input
            value={project.datasetSnapshot.databaseType || ""}
            onChange={(event) => updateSnapshotField("databaseType", event.target.value)}
          />
        </label>
      </div>

      <label className="block-field">
        Project Description
        <textarea
          rows={4}
          value={project.description || ""}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </label>

      <div className="section-panel">
        <h3>Evaluators</h3>
        <label className="block-field">
          Evaluator Dropdown
          <select
            multiple
            className="multi-select"
            value={project.evaluatorNames}
            onChange={(event) =>
              updateField(
                "evaluatorNames",
                Array.from(event.target.selectedOptions, (option) => option.value)
              )
            }
          >
            {evaluators.map((evaluator) => (
              <option key={evaluator.id} value={evaluator.name}>
                {evaluator.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="section-panel">
        <div className="section-header-inline">
          <h3>Project Dataset Snapshot</h3>
          <div className="header-actions">
            <button onClick={handleReEvaluate}>Re-evaluate</button>
            <button onClick={handleSave}>Save Changes</button>
          </div>
        </div>
        <EditableTable
          columns={project.datasetSnapshot.columns}
          rows={project.datasetSnapshot.rows}
          onCellChange={updateRow}
          onAddRow={addRow}
          onAddColumn={addColumn}
        />
      </div>
    </div>
  );
}

export default ProjectDetailPage;
