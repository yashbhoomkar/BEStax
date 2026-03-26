import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

function EvaluatorsPage() {
  const [evaluators, setEvaluators] = useState([]);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  async function loadEvaluators() {
    try {
      setLoading(true);
      const data = await api.listEvaluators();
      setEvaluators(data);
      setStatus({ type: "", message: "" });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEvaluators();
  }, []);

  async function handleDelete(id) {
    try {
      await api.deleteEvaluator(id);
      loadEvaluators();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <div>
      <PageHeader
        title="Evaluator Gallery"
        description="Manage evaluator definitions, scoring range, model, and system prompts."
        actions={<button onClick={() => navigate("/evaluators/new")}>Add Evaluator</button>}
      />
      <StatusBanner type={status.type} message={status.message} />
      {loading ? <p>Loading evaluators...</p> : null}
      <div className="card-grid">
        {evaluators.map((evaluator) => (
          <div className="card" key={evaluator.id}>
            <h3>{evaluator.name}</h3>
            <p>{evaluator.description}</p>
            <p>Range: {evaluator.range}</p>
            <div className="scroll-box">{evaluator.databases}</div>
            <div className="card-actions">
              <Link className="button-link" to={`/evaluators/${evaluator.id}`}>
                Open
              </Link>
              <button onClick={() => handleDelete(evaluator.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvaluatorsPage;
