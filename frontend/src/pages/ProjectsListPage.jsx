import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

function ScoreBadge({ score }) {
  if (!score) return null;
  const num = parseFloat(score);
  const color =
    num >= 0.8 ? "var(--success)" :
    num >= 0.5 ? "var(--warning)" :
    "var(--error)";
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.95rem",
      fontWeight: 500,
      color,
      background: `${color}14`,
      padding: "3px 10px",
      borderRadius: 99,
      border: `1px solid ${color}33`,
    }}>
      {score}
    </span>
  );
}

function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  async function loadProjects() {
    try {
      setLoading(true);
      setError("");
      const data = await api.listProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProjects(); }, []);

  async function handleDelete(projectId) {
    if (!window.confirm("Delete this project? This cannot be undone.")) return;
    try {
      await api.deleteProject(projectId);
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Evaluation Projects"
        description="Create, evaluate, and manage your query-scoring experiments."
        actions={<button onClick={() => navigate("/projects/new")}>New project</button>}
      />
      <StatusBanner type="error" message={error} />

      {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading…</p>}

      {!loading && projects.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: 12 }}>
            No projects yet
          </p>
          <p style={{ fontSize: "0.85rem", marginBottom: 20 }}>
            Create a project to start evaluating your SQL queries.
          </p>
          <button onClick={() => navigate("/projects/new")}>Create first project</button>
        </div>
      )}

      <div className="card-grid">
        {projects.map((project) => (
          <div className="card" key={project.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <h3>{project.name}</h3>
              <ScoreBadge score={project.score} />
            </div>
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
              Dataset: {project.datasetName || "—"}
            </p>
            {project.evaluatorName && (
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Evaluators: {project.evaluatorName}
              </p>
            )}
            <p style={{ fontSize: "0.775rem", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginTop: 4 }}>
              Updated {project.lastUpdated || "—"}
            </p>
            <div className="card-actions">
              <Link className="button-link" to={`/projects/${project.id}`}>Open</Link>
              <button className="btn-danger" onClick={() => handleDelete(project.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProjectsListPage;