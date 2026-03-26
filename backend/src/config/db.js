const mongoose = require("mongoose");

const env = require("./env");

async function connectToMongo() {
  await mongoose.connect(env.mongoUri, {
    dbName: env.mongoDbName
  });
  console.log(`MongoDB connected to database: ${env.mongoDbName}`);
}

module.exports = {
  connectToMongo
};
