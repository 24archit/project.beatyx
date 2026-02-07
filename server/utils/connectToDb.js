require("dotenv").config();
const mongoose = require("mongoose");
let isConnected = false;

async function connectToDb() {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    // eslint-disable-next-line no-console
    console.log("Using existing MongoDB connection ⚡");
    return;
  }

  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    // eslint-disable-next-line no-console
    console.log("MongoDB is connected (State 1) ⚡");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

module.exports = { connectToDb };
