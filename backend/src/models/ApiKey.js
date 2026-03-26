const mongoose = require("mongoose");

const apiKeySchema = new mongoose.Schema(
  {
    apiName: { type: String, required: true, unique: true, trim: true },
    apiKey: { type: String, default: "" }
  },
  {
    timestamps: true,
    collection: "api_keys"
  }
);

module.exports = mongoose.model("ApiKey", apiKeySchema);
