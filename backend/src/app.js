const express = require("express");
const cors = require("cors");

const env = require("./config/env");
const datasetRoutes = require("./routes/datasetRoutes");
const evaluatorRoutes = require("./routes/evaluatorRoutes");
const projectRoutes = require("./routes/projectRoutes");
const apiKeyRoutes = require("./routes/apiKeyRoutes");
const modelManagerRoutes = require("./routes/modelManagerRoutes");
const evaluationRoutes = require("./routes/evaluationRoutes");
const healthRoutes = require("./routes/healthRoutes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(cors({ origin: env.corsOrigin === "*" ? true : env.corsOrigin }));
app.use(express.json({ limit: "5mb" }));

app.use("/api/health", healthRoutes);
app.use("/api/datasets", datasetRoutes);
app.use("/api/evaluators", evaluatorRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/api-keys", apiKeyRoutes);
app.use("/api/model-manager", modelManagerRoutes);
app.use("/api/evaluation", evaluationRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
