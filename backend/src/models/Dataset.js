const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    databaseName: { type: String, default: "" },
    databaseType: { type: String, default: "" },
    columns: { type: [String], default: [] },
    rows: { type: [mongoose.Schema.Types.Mixed], default: [] }
  },
  {
    timestamps: true,
    collection: "datasets"
  }
);

module.exports = mongoose.model("Dataset", datasetSchema);
