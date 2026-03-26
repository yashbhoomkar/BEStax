const {
  DEFAULT_DATASETS,
  DEFAULT_EVALUATORS,
  DEFAULT_PROJECTS,
  DEFAULT_MODEL_MANAGER,
  DEFAULT_API_KEY_RECORDS
} = require("../constants/defaults");
const Dataset = require("../models/Dataset");
const Evaluator = require("../models/Evaluator");
const Project = require("../models/Project");
const ModelConfig = require("../models/ModelConfig");
const ApiKey = require("../models/ApiKey");

async function upsertDefaults(Model, documents, uniqueField) {
  for (const document of documents) {
    await Model.updateOne(
      { [uniqueField]: document[uniqueField] },
      { $setOnInsert: document },
      { upsert: true }
    );
  }
}

async function seedDefaults() {
  await upsertDefaults(Dataset, DEFAULT_DATASETS, "name");
  await upsertDefaults(Evaluator, DEFAULT_EVALUATORS, "name");
  await upsertDefaults(Project, DEFAULT_PROJECTS, "name");
  await upsertDefaults(ModelConfig, DEFAULT_MODEL_MANAGER, "modelKey");
  await upsertDefaults(ApiKey, DEFAULT_API_KEY_RECORDS, "apiName");
  console.log("Default MERN backend data ensured.");
}

module.exports = {
  seedDefaults
};
