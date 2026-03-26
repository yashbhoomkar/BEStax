import { useEffect, useState } from "react";

import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

const API_KEY_CARDS = [
  { apiName: "Gemini_API_KEY", label: "Gemini" },
  { apiName: "Claude_API_KEY", label: "Claude" },
  { apiName: "OpenAI_API_KEY", label: "OpenAI" }
];

const MODEL_CARDS = [
  { modelKey: "Gemini_MODEL_NAME", label: "Gemini" },
  { modelKey: "Claude_MODEL_NAME", label: "Claude" },
  { modelKey: "OpenAI_MODEL_NAME", label: "OpenAI" }
];

function ProfilePage() {
  const [activeTab, setActiveTab] = useState("apiKeys");
  const [apiKeys, setApiKeys] = useState([]);
  const [modelConfigs, setModelConfigs] = useState([]);
  const [draftApiKeys, setDraftApiKeys] = useState({});
  const [draftModels, setDraftModels] = useState({});
  const [status, setStatus] = useState({ type: "", message: "" });

  async function loadProfileData() {
    try {
      const [apiKeyData, modelData] = await Promise.all([
        api.listApiKeys(),
        api.listModelConfigs()
      ]);
      setApiKeys(apiKeyData);
      setModelConfigs(modelData);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  useEffect(() => {
    loadProfileData();
  }, []);

  async function saveApiKey(apiName) {
    try {
      await api.upsertApiKey(apiName, draftApiKeys[apiName] ?? "");
      setStatus({ type: "success", message: `${apiName} saved successfully.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function deleteApiKey(apiName) {
    try {
      await api.deleteApiKey(apiName);
      setStatus({ type: "success", message: `${apiName} deleted successfully.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function saveModel(modelKey) {
    try {
      await api.upsertModelConfig(modelKey, draftModels[modelKey] ?? "");
      setStatus({ type: "success", message: `${modelKey} saved successfully.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function deleteModel(modelKey) {
    try {
      await api.deleteModelConfig(modelKey);
      setStatus({ type: "success", message: `${modelKey} deleted successfully.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Manage provider API keys and model manager settings."
      />
      <StatusBanner type={status.type} message={status.message} />

      <label className="block-field tab-dropdown">
        Profile Section
        <select value={activeTab} onChange={(event) => setActiveTab(event.target.value)}>
          <option value="apiKeys">API Keys</option>
          <option value="models">Model Manager</option>
        </select>
      </label>

      {activeTab === "apiKeys" ? (
        <div className="card-grid">
          {API_KEY_CARDS.map((card) => {
            const existing = apiKeys.find((item) => item.apiName === card.apiName);
            return (
              <div className="card" key={card.apiName}>
                <h3>{card.label}</h3>
                <p>Saved API Key: {existing?.apiKey || "Not available"}</p>
                <div className="inline-form">
                  <input
                    value={draftApiKeys[card.apiName] ?? ""}
                    onChange={(event) =>
                      setDraftApiKeys((current) => ({
                        ...current,
                        [card.apiName]: event.target.value
                      }))
                    }
                    placeholder="Enter API key"
                  />
                  <button onClick={() => saveApiKey(card.apiName)}>Add Key</button>
                </div>
                <button onClick={() => deleteApiKey(card.apiName)}>Delete</button>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-grid">
          {MODEL_CARDS.map((card) => {
            const existing = modelConfigs.find((item) => item.modelKey === card.modelKey);
            return (
              <div className="card" key={card.modelKey}>
                <h3>{card.label}</h3>
                <p>Saved Model: {existing?.modelName || "Not available"}</p>
                <div className="inline-form">
                  <input
                    value={draftModels[card.modelKey] ?? ""}
                    onChange={(event) =>
                      setDraftModels((current) => ({
                        ...current,
                        [card.modelKey]: event.target.value
                      }))
                    }
                    placeholder="Enter model name"
                  />
                  <button onClick={() => saveModel(card.modelKey)}>Save Model</button>
                </div>
                <button onClick={() => deleteModel(card.modelKey)}>Delete</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
