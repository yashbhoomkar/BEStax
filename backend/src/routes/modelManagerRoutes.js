const express = require("express");

const {
  listModelConfigs,
  getModelConfig,
  createModelConfig,
  upsertModelConfig,
  deleteModelConfig
} = require("../controllers/modelManagerController");

const router = express.Router();

router.get("/", listModelConfigs);
router.post("/", createModelConfig);
router.get("/:modelKey", getModelConfig);
router.put("/:modelKey", upsertModelConfig);
router.delete("/:modelKey", deleteModelConfig);

module.exports = router;
