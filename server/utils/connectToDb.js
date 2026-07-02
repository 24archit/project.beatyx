require("dotenv").config();
const mongoose = require("mongoose");
let isConnected = false;

mongoose.connection.on("disconnected", () => {
  isConnected = false;
  console.error("MongoDB disconnected. Attempting reconnection...");
});
mongoose.connection.on("reconnected", () => {
  isConnected = true;
  console.log("MongoDB reconnected successfully.");
});
mongoose.connection.on("error", (err) => {
  isConnected = false;
  console.error("MongoDB connection error:", err.message);
});

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
    // eslint-disable-next-line no-console
    console.log("MongoDB connected successfully! ⚡");
  } catch (error) {
    console.error("FATAL: Database connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = { connectToDb };
