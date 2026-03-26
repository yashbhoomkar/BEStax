const dotenv = require("dotenv");

dotenv.config();

const required = ["MONGO_URI"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

if (process.env.MONGO_URI.includes("username:password@cluster.mongodb.net")) {
  throw new Error(
    "MONGO_URI is still using the template placeholder. Replace it with your real MongoDB Atlas connection string."
  );
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGO_URI,
  mongoDbName: process.env.MONGO_DB_NAME || "beprojectstax_mern_backend",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  geminiBaseUrl:
    process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
  openAiBaseUrl: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  anthropicBaseUrl: process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com/v1"
};
