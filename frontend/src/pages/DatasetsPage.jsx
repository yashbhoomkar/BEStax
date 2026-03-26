import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";
import { MANDATORY_DATASET_COLUMNS } from "../lib/constants";
import { parseExcelFile } from "../lib/helpers";

function ColumnTags({ columns }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, margin: "8px 0" }}>
      {columns.map((col) => (
        <span key={col} style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.72rem",
          padding: "2px 8px",
          borderRadius: 99,
          background: "var(--bg-input)",
          border: "1px solid var(--border)",
          color: MANDATORY_DATASET_COLUMNS.includes(col) ? "var(--text-accent)" : "var(--text-muted)",
        }}>
          {col}
        </span>
      ))}
    </div>
  );
}

function DatasetsPage() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [status, setStatus]     = useState({ type: "", message: "" });
  const [loading, setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);

  async function loadDatasets() {
    try {
      setLoading(true);
      const data = await api.listDatasets();
      setDatasets(data);
      setStatus({ type: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadDatasets(); }, []);

  async function handleDelete(datasetId, name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteDataset(datasetId);
      loadDatasets();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.missingColumns.length > 0) {
        setStatus({ type: "error", message: `Missing mandatory columns: ${parsed.missingColumns.join(", ")}` });
        return;
      }
      await api.createDataset({
        name: parsed.name,
        description: `Uploaded from ${file.name}`,
        databaseName: parsed.name,
        databaseType: "Excel",
        columns: parsed.columns,
        rows: parsed.rows,
      });
      setStatus({ type: "success", message: `"${parsed.name}" uploaded successfully.` });
      loadDatasets();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div>
      <PageHeader
        title="Datasets"
        description="Manage evaluation datasets. Mandatory columns are highlighted in blue."
        actions={
          <div className="header-actions">
            <button onClick={() => navigate("/datasets/new")}>New dataset</button>
            <label className="button-file" style={{ opacity: uploading ? 0.6 : 1 }}>
              {uploading ? "Uploading…" : "Upload Excel"}
              <input type="file" accept=".xlsx,.xls" onChange={handleUpload} hidden disabled={uploading} />
            </label>
          </div>
        }
      />
      <StatusBanner type={status.type} message={status.message} />
      <p className="small-note">
        Mandatory columns: {MANDATORY_DATASET_COLUMNS.join(" · ")}
      </p>

      {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading…</p>}

      {!loading && datasets.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: 12 }}>
            No datasets yet
          </p>
          <p style={{ fontSize: "0.85rem", marginBottom: 20 }}>Upload an Excel file or create one manually.</p>
          <button onClick={() => navigate("/datasets/new")}>Create dataset</button>
        </div>
      )}

      <div className="card-grid">
        {datasets.map((dataset) => (
          <div className="card" key={dataset.id}>
            <h3>{dataset.name}</h3>
            {dataset.description && (
              <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)" }}>{dataset.description}</p>
            )}
            <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
              {dataset.databaseType || "—"} · {dataset.databaseName || "—"}
            </p>
            <ColumnTags columns={dataset.columns || []} />
            <p style={{ fontSize: "0.775rem", color: "var(--text-muted)" }}>
              {dataset.rows?.length ?? 0} row{dataset.rows?.length !== 1 ? "s" : ""}
            </p>
            <div className="card-actions">
              <Link className="button-link" to={`/datasets/${dataset.id}`}>Open</Link>
              <button className="btn-danger" onClick={() => handleDelete(dataset.id, dataset.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DatasetsPage;