const asyncHandler = require("../utils/asyncHandler");
const { runEvaluation, reEvaluateProject } = require("../services/evaluationService");

const runEvaluationHandler = asyncHandler(async (req, res) => {
  const result = await runEvaluation(req.body);
  res.json(result);
});

const reEvaluateProjectHandler = asyncHandler(async (req, res) => {
  const project = await reEvaluateProject(req.params.projectId);
  res.json(project);
});

module.exports = {
  runEvaluationHandler,
  reEvaluateProjectHandler
};
