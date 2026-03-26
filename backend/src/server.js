const app = require("./app");
const env = require("./config/env");
const { connectToMongo } = require("./config/db");
const { seedDefaults } = require("./services/seedService");

async function startServer() {
  await connectToMongo();
  await seedDefaults();

  app.listen(env.port, () => {
    console.log(`MERN backend listening on port ${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start MERN backend:", error);
  process.exit(1);
});
