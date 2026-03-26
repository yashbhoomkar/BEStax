const mongoose = require("mongoose");

const modelConfigSchema = new mongoose.Schema(
  {
    modelKey: { type: String, required: true, unique: true, trim: true },
    modelName: { type: String, required: true, trim: true }
  },
  {
    timestamps: true,
    collection: "model_manager"
  }
);

module.exports = mongoose.model("ModelConfig", modelConfigSchema);
