import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import EditableTable from "../components/EditableTable";
import { api } from "../lib/api";
import { MANDATORY_DATASET_COLUMNS } from "../lib/constants";
import { createBlankRow, normalizeRows } from "../lib/helpers";

function buildEmptyDataset() {
  return {
    name: "",
    description: "",
    databaseName: "",
    databaseType: "",
    columns: [...MANDATORY_DATASET_COLUMNS],
    rows: [createBlankRow(MANDATORY_DATASET_COLUMNS)]
  };
}

function DatasetDetailPage() {
  const { datasetId } = useParams();
  const navigate = useNavigate();
  const isCreateMode = datasetId === "new";
  const [dataset, setDataset] = useState(buildEmptyDataset);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(!isCreateMode);

  useEffect(() => {
    if (isCreateMode) {
      return;
    }

    async function loadDataset() {
      try {
        const data = await api.getDataset(datasetId);
        setDataset({
          ...data,
          columns: [...(data.columns || [])],
          rows: normalizeRows(data.rows || [], data.columns || [])
        });
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    }

    loadDataset();
  }, [datasetId, isCreateMode]);

  function updateField(field, value) {
    setDataset((current) => ({ ...current, [field]: value }));
  }

  function updateRow(rowIndex, column, value) {
    setDataset((current) => ({
      ...current,
      rows: current.rows.map((row, index) =>
        index === rowIndex ? { ...row, [column]: value } : row
      )
    }));
  }

  function addRow() {
    setDataset((current) => ({
      ...current,
      rows: [...current.rows, createBlankRow(current.columns)]
    }));
  }

  function addColumn() {
    const columnName = window.prompt("Enter the new column name");
    if (!columnName?.trim()) {
      return;
    }

    setDataset((current) => {
      if (current.columns.includes(columnName)) {
        return current;
      }
      return {
        ...current,
        columns: [...current.columns, columnName],
        rows: current.rows.map((row) => ({ ...row, [columnName]: "" }))
      };
    });
  }

  async function handleSave() {
    try {
      const payload = {
        name: dataset.name,
        description: dataset.description,
        databaseName: dataset.databaseName,
        databaseType: dataset.databaseType,
        columns: dataset.columns,
        rows: dataset.rows
      };

      if (isCreateMode) {
        const created = await api.createDataset(payload);
        navigate(`/datasets/${created.id}`);
        return;
      }

      const updated = await api.updateDataset(datasetId, payload);
      setDataset({
        ...updated,
        columns: [...(updated.columns || [])],
        rows: normalizeRows(updated.rows || [], updated.columns || [])
      });
      setStatus({ type: "success", message: "Dataset saved successfully." });
    } catch (err) {
      const details = err.details?.missingColumns;
      const detailText = details ? ` Missing: ${details.join(", ")}` : "";
      setStatus({ type: "error", message: `${err.message}${detailText}` });
    }
  }

  if (loading) {
    return <p>Loading dataset...</p>;
  }

  return (
    <div>
      <PageHeader
        title={isCreateMode ? "Create Dataset" : "Dataset Detail"}
        description="Manage dataset metadata and edit the full tabular dataset."
        actions={<button onClick={handleSave}>Save Dataset</button>}
      />
      <StatusBanner type={status.type} message={status.message} />

      <div className="form-grid">
        <label>
          Dataset Name
          <input value={dataset.name} onChange={(event) => updateField("name", event.target.value)} />
        </label>
        <label>
          Database Name
          <input
            value={dataset.databaseName}
            onChange={(event) => updateField("databaseName", event.target.value)}
          />
        </label>
        <label>
          Database Type
          <input
            value={dataset.databaseType}
            onChange={(event) => updateField("databaseType", event.target.value)}
          />
        </label>
      </div>

      <label className="block-field">
        Dataset Description
        <textarea
          rows={4}
          value={dataset.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </label>

      <EditableTable
        columns={dataset.columns}
        rows={dataset.rows}
        onCellChange={updateRow}
        onAddRow={addRow}
        onAddColumn={addColumn}
      />
    </div>
  );
}

export default DatasetDetailPage;
