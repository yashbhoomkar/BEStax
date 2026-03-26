const express = require("express");

const {
  runEvaluationHandler,
  reEvaluateProjectHandler
} = require("../controllers/evaluationController");

const router = express.Router();

router.post("/run", runEvaluationHandler);
router.post("/projects/:projectId/re-evaluate", reEvaluateProjectHandler);

module.exports = router;
