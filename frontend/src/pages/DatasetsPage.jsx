import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";
import { MANDATORY_DATASET_COLUMNS } from "../lib/constants";
import { parseExcelFile } from "../lib/helpers";

function DatasetsPage() {
  const navigate = useNavigate();
  const [datasets, setDatasets] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadDatasets();
  }, []);

  async function handleDelete(datasetId) {
    try {
      await api.deleteDataset(datasetId);
      loadDatasets();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const parsed = await parseExcelFile(file);
      if (parsed.missingColumns.length > 0) {
        setStatus({
          type: "error",
          message: `Missing mandatory columns: ${parsed.missingColumns.join(", ")}`
        });
        return;
      }

      await api.createDataset({
        name: parsed.name,
        description: `Uploaded from Excel file ${file.name}`,
        databaseName: parsed.name,
        databaseType: "Excel",
        columns: parsed.columns,
        rows: parsed.rows
      });
      setStatus({ type: "success", message: "Dataset uploaded successfully." });
      loadDatasets();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <div>
      <PageHeader
        title="Datasets"
        description="Create, upload, edit, and delete datasets used by evaluation projects."
        actions={
          <div className="header-actions">
            <button onClick={() => navigate("/datasets/new")}>Create Dataset</button>
            <label className="button-file">
              Upload Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleUpload}
                hidden
              />
            </label>
          </div>
        }
      />
      <StatusBanner type={status.type} message={status.message} />
      <p className="small-note">
        Mandatory columns: {MANDATORY_DATASET_COLUMNS.join(", ")}
      </p>
      {loading ? <p>Loading datasets...</p> : null}
      <div className="card-grid">
        {datasets.map((dataset) => (
          <div className="card" key={dataset.id}>
            <h3>{dataset.name}</h3>
            <p>{dataset.description}</p>
            <p>Database Name: {dataset.databaseName}</p>
            <p>Database Type: {dataset.databaseType}</p>
            <div className="scroll-box">{dataset.columns.join(", ")}</div>
            <div className="card-actions">
              <Link className="button-link" to={`/datasets/${dataset.id}`}>
                Open
              </Link>
              <button onClick={() => handleDelete(dataset.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DatasetsPage;
