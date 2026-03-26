const ModelConfig = require("../models/ModelConfig");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { serializeDocument } = require("../utils/serialize");
const { normalizeModelConfigPayload } = require("../utils/validation");

const listModelConfigs = asyncHandler(async (req, res) => {
  const modelConfigs = await ModelConfig.find().sort({ modelKey: 1 });
  res.json(modelConfigs.map(serializeDocument));
});

const getModelConfig = asyncHandler(async (req, res) => {
  const modelConfig = await ModelConfig.findOne({ modelKey: req.params.modelKey });
  if (!modelConfig) {
    throw new AppError(404, "Model manager record not found.");
  }
  res.json(serializeDocument(modelConfig));
});

const createModelConfig = asyncHandler(async (req, res) => {
  const payload = normalizeModelConfigPayload(req.body);
  const modelConfig = await ModelConfig.create(payload);
  res.status(201).json(serializeDocument(modelConfig));
});

const upsertModelConfig = asyncHandler(async (req, res) => {
  const payload = normalizeModelConfigPayload({
    modelKey: req.params.modelKey,
    modelName: req.body.modelName
  });
  const modelConfig = await ModelConfig.findOneAndUpdate(
    { modelKey: payload.modelKey },
    payload,
    {
      new: true,
      upsert: true,
      runValidators: true
    }
  );
  res.json(serializeDocument(modelConfig));
});

const deleteModelConfig = asyncHandler(async (req, res) => {
  const modelConfig = await ModelConfig.findOneAndDelete({ modelKey: req.params.modelKey });
  if (!modelConfig) {
    throw new AppError(404, "Model manager record not found.");
  }
  res.json({ message: "Model manager record deleted successfully." });
});

module.exports = {
  listModelConfigs,
  getModelConfig,
  createModelConfig,
  upsertModelConfig,
  deleteModelConfig
};
