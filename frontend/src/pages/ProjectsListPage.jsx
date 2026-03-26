import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

function ProjectsListPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadProjects();
  }, []);

  async function handleDelete(projectId) {
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
        description="Create, evaluate, reopen, edit, and re-evaluate saved projects."
        actions={<button onClick={() => navigate("/projects/new")}>Add Project</button>}
      />
      <StatusBanner type="error" message={error} />
      {loading ? <p>Loading projects...</p> : null}
      <div className="card-grid">
        {projects.map((project) => (
          <div className="card" key={project.id}>
            <h3>{project.name}</h3>
            <p>Dataset Name: {project.datasetName}</p>
            <p>Score: {project.score}</p>
            <p>Last updated: {project.lastUpdated}</p>
            <div className="card-actions">
              <Link className="button-link" to={`/projects/${project.id}`}>
                Open
              </Link>
              <button onClick={() => handleDelete(project.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {!loading && projects.length === 0 ? <p>No projects found.</p> : null}
    </div>
  );
}

export default ProjectsListPage;
