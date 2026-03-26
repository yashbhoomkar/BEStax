const express = require("express");

const {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
} = require("../controllers/projectController");

const router = express.Router();

router.get("/", listProjects);
router.post("/", createProject);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
