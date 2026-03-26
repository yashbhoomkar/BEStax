import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

const MODEL_COLORS = {
  Gemini: { color: "#34c78a", bg: "rgba(52,199,138,0.1)", border: "rgba(52,199,138,0.25)" },
  Claude: { color: "#c084fc", bg: "rgba(192,132,252,0.1)", border: "rgba(192,132,252,0.25)" },
  OpenAI: { color: "#63b3ed", bg: "rgba(99,179,237,0.1)", border: "rgba(99,179,237,0.25)" },
};

function ModelBadge({ model }) {
  const style = MODEL_COLORS[model] || MODEL_COLORS.Gemini;
  return (
    <span style={{
      fontFamily: "var(--font-mono)",
      fontSize: "0.7rem",
      fontWeight: 500,
      padding: "3px 9px",
      borderRadius: 99,
      color: style.color,
      background: style.bg,
      border: `1px solid ${style.border}`,
      flexShrink: 0,
    }}>
      {model}
    </span>
  );
}

function EvaluatorsPage() {
  const [evaluators, setEvaluators] = useState([]);
  const [status, setStatus]         = useState({ type: "", message: "" });
  const [loading, setLoading]       = useState(true);
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

  useEffect(() => { loadEvaluators(); }, []);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete evaluator "${name}"?`)) return;
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
        description="Define scoring rules, provider, range, and system prompts for each evaluator."
        actions={<button onClick={() => navigate("/evaluators/new")}>New evaluator</button>}
      />
      <StatusBanner type={status.type} message={status.message} />

      {loading && <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading…</p>}

      {!loading && evaluators.length === 0 && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-muted)",
          border: "1px dashed var(--border)",
          borderRadius: "var(--radius-lg)",
        }}>
          <p style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", color: "var(--text-secondary)", marginBottom: 12 }}>
            No evaluators yet
          </p>
          <p style={{ fontSize: "0.85rem", marginBottom: 20 }}>Create a scoring evaluator to use in projects.</p>
          <button onClick={() => navigate("/evaluators/new")}>Create evaluator</button>
        </div>
      )}

      <div className="card-grid">
        {evaluators.map((ev) => (
          <div className="card" key={ev.id}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
              <h3>{ev.name}</h3>
              <ModelBadge model={ev.currentModel} />
            </div>
            <p style={{ fontSize: "0.835rem", color: "var(--text-secondary)" }}>{ev.description}</p>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.775rem", color: "var(--text-muted)" }}>
              Range: {ev.range || "—"}
            </p>
            {ev.databases && (
              <div className="scroll-box" style={{ maxHeight: 56 }}>{ev.databases}</div>
            )}
            <div className="card-actions">
              <Link className="button-link" to={`/evaluators/${ev.id}`}>Open</Link>
              <button className="btn-danger" onClick={() => handleDelete(ev.id, ev.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EvaluatorsPage;