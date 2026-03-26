const mongoose = require("mongoose");

const evaluatorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, default: "" },
    range: { type: String, default: "" },
    databases: { type: String, default: "" },
    systemPrompt: { type: String, default: "" },
    currentModel: { type: String, default: "Gemini" }
  },
  {
    timestamps: true,
    collection: "evaluators"
  }
);

module.exports = mongoose.model("Evaluator", evaluatorSchema);
