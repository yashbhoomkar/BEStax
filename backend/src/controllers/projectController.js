const Project = require("../models/Project");
const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/appError");
const { serializeDocument } = require("../utils/serialize");
const { normalizeProjectPayload } = require("../utils/validation");

const listProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find().sort({ name: 1 });
  res.json(projects.map(serializeDocument));
});

const getProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) {
    throw new AppError(404, "Project not found.");
  }
  res.json(serializeDocument(project));
});

const createProject = asyncHandler(async (req, res) => {
  const payload = normalizeProjectPayload(req.body);
  const project = await Project.create(payload);
  res.status(201).json(serializeDocument(project));
});

const updateProject = asyncHandler(async (req, res) => {
  const payload = normalizeProjectPayload(req.body);
  const project = await Project.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });
  if (!project) {
    throw new AppError(404, "Project not found.");
  }
  res.json(serializeDocument(project));
});

const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) {
    throw new AppError(404, "Project not found.");
  }
  res.json({ message: "Project deleted successfully." });
});

module.exports = {
  listProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject
};
