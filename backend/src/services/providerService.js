const axios = require("axios");

const env = require("../config/env");
const ApiKey = require("../models/ApiKey");
const ModelConfig = require("../models/ModelConfig");
const AppError = require("../utils/appError");

const PROVIDER_CONFIG = {
  Gemini: {
    apiName: "Gemini_API_KEY",
    modelKey: "Gemini_MODEL_NAME",
    defaultModel: "gemini-2.5-flash"
  },
  Claude: {
    apiName: "Claude_API_KEY",
    modelKey: "Claude_MODEL_NAME",
    defaultModel: "claude-3-5-sonnet-latest"
  },
  OpenAI: {
    apiName: "OpenAI_API_KEY",
    modelKey: "OpenAI_MODEL_NAME",
    defaultModel: "gpt-4.1-mini"
  }
};

function normalizeProviderName(providerName) {
  if (!providerName) {
    return "Gemini";
  }
  const normalized = String(providerName).trim().toLowerCase();
  if (normalized === "gemini") {
    return "Gemini";
  }
  if (normalized === "claude") {
    return "Claude";
  }
  if (normalized === "openai") {
    return "OpenAI";
  }
  return "Gemini";
}

async function getProviderSecrets(providerName) {
  const normalizedProvider = normalizeProviderName(providerName);
  const config = PROVIDER_CONFIG[normalizedProvider];

  const [apiRecord, modelRecord] = await Promise.all([
    ApiKey.findOne({ apiName: config.apiName }),
    ModelConfig.findOne({ modelKey: config.modelKey })
  ]);

  if (!apiRecord || !apiRecord.apiKey) {
    throw new AppError(400, `${normalizedProvider} API key not found.`);
  }

  return {
    provider: normalizedProvider,
    apiKey: apiRecord.apiKey,
    modelName: modelRecord?.modelName || config.defaultModel
  };
}

async function callGemini(prompt, secrets) {
  const url = `${env.geminiBaseUrl}/models/${secrets.modelName}:generateContent?key=${secrets.apiKey}`;
  const payload = {
    contents: [
      {
        parts: [{ text: prompt }]
      }
    ]
  };

  const response = await axios.post(url, payload, {
    headers: { "Content-Type": "application/json" },
    timeout: 30000
  });

  const parts = response.data?.candidates?.[0]?.content?.parts || [];
  const text = parts.map((part) => part.text || "").join("").trim();
  console.log("Gemini response:", text || response.data);
  if (!text) {
    throw new AppError(502, "Gemini returned an empty response.");
  }
  return text;
}

async function callClaude(prompt, secrets) {
  const url = `${env.anthropicBaseUrl}/messages`;
  const payload = {
    model: secrets.modelName,
    max_tokens: 1200,
    messages: [{ role: "user", content: prompt }]
  };

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": secrets.apiKey,
      "anthropic-version": "2023-06-01"
    },
    timeout: 30000
  });

  const text = (response.data?.content || [])
    .map((item) => (item.type === "text" ? item.text : ""))
    .join("")
    .trim();
  console.log("Claude response:", text || response.data);
  if (!text) {
    throw new AppError(502, "Claude returned an empty response.");
  }
  return text;
}

async function callOpenAi(prompt, secrets) {
  const url = `${env.openAiBaseUrl}/responses`;
  const payload = {
    model: secrets.modelName,
    input: prompt
  };

  const response = await axios.post(url, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${secrets.apiKey}`
    },
    timeout: 30000
  });

  const text = response.data?.output_text?.trim() || "";
  console.log("OpenAI response:", text || response.data);
  if (!text) {
    throw new AppError(502, "OpenAI returned an empty response.");
  }
  return text;
}

async function callProvider(providerName, prompt) {
  const secrets = await getProviderSecrets(providerName);

  try {
    if (secrets.provider === "Gemini") {
      return await callGemini(prompt, secrets);
    }
    if (secrets.provider === "Claude") {
      return await callClaude(prompt, secrets);
    }
    return await callOpenAi(prompt, secrets);
  } catch (error) {
    const statusCode = error.response?.status || error.statusCode || 500;
    const providerMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      "Provider request failed.";
    throw new AppError(statusCode, `${secrets.provider} request failed: ${providerMessage}`);
  }
}

module.exports = {
  callProvider,
  normalizeProviderName
};
