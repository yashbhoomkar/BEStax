const express = require("express");

const {
  listApiKeys,
  getApiKey,
  createApiKey,
  upsertApiKey,
  deleteApiKey
} = require("../controllers/apiKeyController");

const router = express.Router();

router.get("/", listApiKeys);
router.post("/", createApiKey);
router.get("/:apiName", getApiKey);
router.put("/:apiName", upsertApiKey);
router.delete("/:apiName", deleteApiKey);

module.exports = router;
