import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";
import StatusBanner from "../components/StatusBanner";
import { api } from "../lib/api";

const API_KEY_CARDS = [
  { apiName: "Gemini_API_KEY",  label: "Gemini",  badge: "google"    },
  { apiName: "Claude_API_KEY",  label: "Claude",  badge: "anthropic" },
  { apiName: "OpenAI_API_KEY",  label: "OpenAI",  badge: "openai"    },
];

const MODEL_CARDS = [
  { modelKey: "Gemini_MODEL_NAME",  label: "Gemini"  },
  { modelKey: "Claude_MODEL_NAME",  label: "Claude"  },
  { modelKey: "OpenAI_MODEL_NAME",  label: "OpenAI"  },
];

function ProfilePage() {
  const [activeTab, setActiveTab]       = useState("apiKeys");
  const [apiKeys, setApiKeys]           = useState([]);
  const [modelConfigs, setModelConfigs] = useState([]);
  const [draftApiKeys, setDraftApiKeys] = useState({});
  const [draftModels, setDraftModels]   = useState({});
  const [status, setStatus]             = useState({ type: "", message: "" });

  async function loadProfileData() {
    try {
      const [keyData, modelData] = await Promise.all([
        api.listApiKeys(),
        api.listModelConfigs(),
      ]);
      setApiKeys(keyData);
      setModelConfigs(modelData);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  useEffect(() => { loadProfileData(); }, []);

  async function saveApiKey(apiName) {
    try {
      await api.upsertApiKey(apiName, draftApiKeys[apiName] ?? "");
      setDraftApiKeys((prev) => ({ ...prev, [apiName]: "" }));
      setStatus({ type: "success", message: `${apiName} saved.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function deleteApiKey(apiName) {
    try {
      await api.deleteApiKey(apiName);
      setStatus({ type: "success", message: `${apiName} removed.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function saveModel(modelKey) {
    try {
      await api.upsertModelConfig(modelKey, draftModels[modelKey] ?? "");
      setDraftModels((prev) => ({ ...prev, [modelKey]: "" }));
      setStatus({ type: "success", message: `${modelKey} saved.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  async function deleteModel(modelKey) {
    try {
      await api.deleteModelConfig(modelKey);
      setStatus({ type: "success", message: `${modelKey} removed.` });
      loadProfileData();
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    }
  }

  function maskKey(key) {
    if (!key) return "Not configured";
    return key.length <= 8 ? "••••••••" : `${key.slice(0, 4)}${"•".repeat(Math.min(key.length - 8, 20))}${key.slice(-4)}`;
  }

  return (
    <div>
      <PageHeader
        title="Profile"
        description="Configure provider API keys and model names used during evaluation."
      />
      <StatusBanner type={status.type} message={status.message} />

      <div className="tab-bar">
        <button
          className={activeTab === "apiKeys" ? "tab-active" : ""}
          onClick={() => setActiveTab("apiKeys")}
        >
          API Keys
        </button>
        <button
          className={activeTab === "models" ? "tab-active" : ""}
          onClick={() => setActiveTab("models")}
        >
          Model Manager
        </button>
      </div>

      {activeTab === "apiKeys" ? (
        <div className="card-grid">
          {API_KEY_CARDS.map((card) => {
            const existing = apiKeys.find((k) => k.apiName === card.apiName);
            return (
              <div className="profile-card" key={card.apiName}>
                <div className="profile-card-header">
                  <h3>{card.label}</h3>
                  <span className="provider-badge">{card.badge}</span>
                </div>
                <div className="saved-value">{maskKey(existing?.apiKey)}</div>
                <div className="inline-form">
                  <input
                    type="password"
                    value={draftApiKeys[card.apiName] ?? ""}
                    onChange={(e) =>
                      setDraftApiKeys((prev) => ({ ...prev, [card.apiName]: e.target.value }))
                    }
                    placeholder="Paste new key…"
                  />
                  <button onClick={() => saveApiKey(card.apiName)}>Save</button>
                </div>
                {existing?.apiKey && (
                  <button className="btn-danger" onClick={() => deleteApiKey(card.apiName)}>
                    Remove key
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-grid">
          {MODEL_CARDS.map((card) => {
            const existing = modelConfigs.find((m) => m.modelKey === card.modelKey);
            return (
              <div className="profile-card" key={card.modelKey}>
                <div className="profile-card-header">
                  <h3>{card.label}</h3>
                  <span className="provider-badge">model</span>
                </div>
                <div className="saved-value">{existing?.modelName || "Not configured"}</div>
                <div className="inline-form">
                  <input
                    value={draftModels[card.modelKey] ?? ""}
                    onChange={(e) =>
                      setDraftModels((prev) => ({ ...prev, [card.modelKey]: e.target.value }))
                    }
                    placeholder="e.g. claude-3-5-sonnet-latest"
                  />
                  <button onClick={() => saveModel(card.modelKey)}>Save</button>
                </div>
                {existing?.modelName && (
                  <button className="btn-danger" onClick={() => deleteModel(card.modelKey)}>
                    Reset
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;