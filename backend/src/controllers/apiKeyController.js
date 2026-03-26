const ApiKey = require("../models/ApiKey");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { serializeDocument } = require("../utils/serialize");
const { normalizeApiKeyPayload } = require("../utils/validation");

const listApiKeys = asyncHandler(async (req, res) => {
  const apiKeys = await ApiKey.find().sort({ apiName: 1 });
  res.json(apiKeys.map(serializeDocument));
});

const getApiKey = asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findOne({ apiName: req.params.apiName });
  if (!apiKey) {
    throw new AppError(404, "API key record not found.");
  }
  res.json(serializeDocument(apiKey));
});

const createApiKey = asyncHandler(async (req, res) => {
  const payload = normalizeApiKeyPayload(req.body);
  const apiKey = await ApiKey.create(payload);
  res.status(201).json(serializeDocument(apiKey));
});

const upsertApiKey = asyncHandler(async (req, res) => {
  const payload = normalizeApiKeyPayload({
    apiName: req.params.apiName,
    apiKey: req.body.apiKey
  });
  const apiKey = await ApiKey.findOneAndUpdate({ apiName: payload.apiName }, payload, {
    new: true,
    upsert: true,
    runValidators: true
  });
  res.json(serializeDocument(apiKey));
});

const deleteApiKey = asyncHandler(async (req, res) => {
  const apiKey = await ApiKey.findOneAndDelete({ apiName: req.params.apiName });
  if (!apiKey) {
    throw new AppError(404, "API key record not found.");
  }
  res.json({ message: "API key record deleted successfully." });
});

module.exports = {
  listApiKeys,
  getApiKey,
  createApiKey,
  upsertApiKey,
  deleteApiKey
};
