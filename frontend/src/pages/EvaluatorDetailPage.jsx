import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

const EMPTY_EVALUATOR = {
  name: "",
  description: "",
  range: "",
  databases: "",
  systemPrompt: "",
  currentModel: "Gemini"
};

function EvaluatorDetailPage() {
  const { evaluatorId } = useParams();
  const navigate = useNavigate();
  const isCreateMode = evaluatorId === "new";
  const [evaluator, setEvaluator] = useState(EMPTY_EVALUATOR);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [loading, setLoading] = useState(!isCreateMode);

  useEffect(() => {
    if (isCreateMode) {
      return;
    }

    async function loadEvaluator() {
      try {
        const data = await api.getEvaluator(evaluatorId);
        setEvaluator(data);
      } catch (err) {
        setStatus({ type: "error", message: err.message });
      } finally {
        setLoading(false);
      }
    }

    loadEvaluator();
  }, [evaluatorId, isCreateMode]);

  function updateField(field, value) {
    setEvaluator((current) => ({ ...current, [field]: value }));
  }

  async function handleSave() {
    try {
      if (isCreateMode) {
        const created = await api.createEvaluator(evaluator);
        navigate(`/evaluators/${created.id}`);
        return;
      }
      const updated = await api.updateEvaluator(evaluatorId, evaluator);
      setEvaluator(updated);
      setStatus({ type: "success", message: "Evaluator saved successfully." });
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  if (loading) {
    return <p>Loading evaluator...</p>;
  }

  return (
    <div>
      <PageHeader
        title={isCreateMode ? "Create Evaluator" : "Evaluator Detail"}
        description="Define evaluator metadata, scoring range, provider, and system prompt."
        actions={<button onClick={handleSave}>Save Evaluator</button>}
      />
      <StatusBanner type={status.type} message={status.message} />
      <div className="form-grid">
        <label>
          Name of the Evaluator
          <input
            value={evaluator.name}
            onChange={(event) => updateField("name", event.target.value)}
          />
        </label>
        <label>
          Current Model
          <select
            value={evaluator.currentModel}
            onChange={(event) => updateField("currentModel", event.target.value)}
          >
            <option value="Gemini">Gemini</option>
            <option value="Claude">Claude</option>
            <option value="OpenAI">OpenAI</option>
          </select>
        </label>
        <label>
          Range of the Evaluator
          <input
            value={evaluator.range}
            onChange={(event) => updateField("range", event.target.value)}
          />
        </label>
      </div>

      <label className="block-field">
        Description of the Evaluator
        <textarea
          rows={4}
          value={evaluator.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </label>

      <label className="block-field">
        Evaluator applicable to Databases
        <textarea
          rows={3}
          value={evaluator.databases}
          onChange={(event) => updateField("databases", event.target.value)}
        />
      </label>

      <label className="block-field">
        System Prompt
        <textarea
          rows={8}
          value={evaluator.systemPrompt}
          onChange={(event) => updateField("systemPrompt", event.target.value)}
        />
      </label>
    </div>
  );
}

export default EvaluatorDetailPage;
