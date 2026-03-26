const express = require("express");

const {
  listEvaluators,
  getEvaluator,
  createEvaluator,
  updateEvaluator,
  deleteEvaluator
} = require("../controllers/evaluatorController");

const router = express.Router();

router.get("/", listEvaluators);
router.post("/", createEvaluator);
router.get("/:id", getEvaluator);
router.put("/:id", updateEvaluator);
router.delete("/:id", deleteEvaluator);

module.exports = router;
