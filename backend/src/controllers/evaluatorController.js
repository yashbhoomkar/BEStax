const Evaluator = require("../models/Evaluator");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { serializeDocument } = require("../utils/serialize");
const { normalizeEvaluatorPayload } = require("../utils/validation");

const listEvaluators = asyncHandler(async (req, res) => {
  const evaluators = await Evaluator.find().sort({ name: 1 });
  res.json(evaluators.map(serializeDocument));
});

const getEvaluator = asyncHandler(async (req, res) => {
  const evaluator = await Evaluator.findById(req.params.id);
  if (!evaluator) {
    throw new AppError(404, "Evaluator not found.");
  }
  res.json(serializeDocument(evaluator));
});

const createEvaluator = asyncHandler(async (req, res) => {
  const payload = normalizeEvaluatorPayload(req.body);
  const evaluator = await Evaluator.create(payload);
  res.status(201).json(serializeDocument(evaluator));
});

const updateEvaluator = asyncHandler(async (req, res) => {
  const payload = normalizeEvaluatorPayload(req.body);
  const evaluator = await Evaluator.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!evaluator) {
    throw new AppError(404, "Evaluator not found.");
  }
  res.json(serializeDocument(evaluator));
});

const deleteEvaluator = asyncHandler(async (req, res) => {
  const evaluator = await Evaluator.findByIdAndDelete(req.params.id);
  if (!evaluator) {
    throw new AppError(404, "Evaluator not found.");
  }
  res.json({ message: "Evaluator deleted successfully." });
});

module.exports = {
  listEvaluators,
  getEvaluator,
  createEvaluator,
  updateEvaluator,
  deleteEvaluator
};
