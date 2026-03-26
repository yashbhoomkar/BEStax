const express = require("express");

const {
  listDatasets,
  getDataset,
  createDataset,
  updateDataset,
  deleteDataset
} = require("../controllers/datasetController");

const router = express.Router();

router.get("/", listDatasets);
router.post("/", createDataset);
router.get("/:id", getDataset);
router.put("/:id", updateDataset);
router.delete("/:id", deleteDataset);

module.exports = router;
