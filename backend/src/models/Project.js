const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    datasetName: { type: String, default: "" },
    score: { type: String, default: "" },
    lastUpdated: { type: String, default: "" },
    description: { type: String, default: "" },
    evaluatorName: { type: String, default: "" },
    evaluatorNames: { type: [String], default: [] },
    datasetSnapshot: {
      name: { type: String, default: "" },
      description: { type: String, default: "" },
      databaseName: { type: String, default: "" },
      databaseType: { type: String, default: "" },
      columns: { type: [String], default: [] },
      rows: { type: [mongoose.Schema.Types.Mixed], default: [] }
    }
  },
  {
    timestamps: true,
    collection: "evaluation_projects"
  }
);

module.exports = mongoose.model("Project", projectSchema);
