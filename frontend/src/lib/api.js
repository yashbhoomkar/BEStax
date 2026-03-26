const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "object" && payload !== null
        ? payload.message || "Request failed."
        : "Request failed.";
    const error = new Error(message);
    error.status = response.status;
    error.details = typeof payload === "object" && payload !== null ? payload.details : null;
    throw error;
  }

  return payload;
}

export const api = {
  health: () => request("/api/health"),
  listDatasets: () => request("/api/datasets"),
  getDataset: (id) => request(`/api/datasets/${id}`),
  createDataset: (payload) =>
    request("/api/datasets", { method: "POST", body: JSON.stringify(payload) }),
  updateDataset: (id, payload) =>
    request(`/api/datasets/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteDataset: (id) => request(`/api/datasets/${id}`, { method: "DELETE" }),

  listEvaluators: () => request("/api/evaluators"),
  getEvaluator: (id) => request(`/api/evaluators/${id}`),
  createEvaluator: (payload) =>
    request("/api/evaluators", { method: "POST", body: JSON.stringify(payload) }),
  updateEvaluator: (id, payload) =>
    request(`/api/evaluators/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteEvaluator: (id) => request(`/api/evaluators/${id}`, { method: "DELETE" }),

  listProjects: () => request("/api/projects"),
  getProject: (id) => request(`/api/projects/${id}`),
  createProject: (payload) =>
    request("/api/projects", { method: "POST", body: JSON.stringify(payload) }),
  updateProject: (id, payload) =>
    request(`/api/projects/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: "DELETE" }),

  listApiKeys: () => request("/api/api-keys"),
  upsertApiKey: (apiName, apiKey) =>
    request(`/api/api-keys/${apiName}`, {
      method: "PUT",
      body: JSON.stringify({ apiKey })
    }),
  deleteApiKey: (apiName) => request(`/api/api-keys/${apiName}`, { method: "DELETE" }),

  listModelConfigs: () => request("/api/model-manager"),
  upsertModelConfig: (modelKey, modelName) =>
    request(`/api/model-manager/${modelKey}`, {
      method: "PUT",
      body: JSON.stringify({ modelName })
    }),
  deleteModelConfig: (modelKey) =>
    request(`/api/model-manager/${modelKey}`, { method: "DELETE" }),

  runEvaluation: (payload) =>
    request("/api/evaluation/run", { method: "POST", body: JSON.stringify(payload) }),
  reEvaluateProject: (projectId) =>
    request(`/api/evaluation/projects/${projectId}/re-evaluate`, { method: "POST" })
};

export { API_BASE_URL };
