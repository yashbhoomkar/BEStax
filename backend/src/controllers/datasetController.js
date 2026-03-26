const Dataset = require("../models/Dataset");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { serializeDocument } = require("../utils/serialize");
const { normalizeDatasetPayload } = require("../utils/validation");

const listDatasets = asyncHandler(async (req, res) => {
  const datasets = await Dataset.find().sort({ name: 1 });
  res.json(datasets.map(serializeDocument));
});

const getDataset = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findById(req.params.id);
  if (!dataset) {
    throw new AppError(404, "Dataset not found.");
  }
  res.json(serializeDocument(dataset));
});

const createDataset = asyncHandler(async (req, res) => {
  const payload = normalizeDatasetPayload(req.body);
  const dataset = await Dataset.create(payload);
  res.status(201).json(serializeDocument(dataset));
});

const updateDataset = asyncHandler(async (req, res) => {
  const payload = normalizeDatasetPayload(req.body);
  const dataset = await Dataset.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!dataset) {
    throw new AppError(404, "Dataset not found.");
  }
  res.json(serializeDocument(dataset));
});

const deleteDataset = asyncHandler(async (req, res) => {
  const dataset = await Dataset.findByIdAndDelete(req.params.id);
  if (!dataset) {
    throw new AppError(404, "Dataset not found.");
  }
  res.json({ message: "Dataset deleted successfully." });
});

module.exports = {
  listDatasets,
  getDataset,
  createDataset,
  updateDataset,
  deleteDataset
};
