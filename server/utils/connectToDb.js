require("dotenv").config();
// server/utils/connectToDb.js
const mongoose = require("mongoose");

// Global variable to cache the connection across invocations (Hot/Warm starts)
let isConnected = false; 

async function connectToDb() {
  mongoose.set("strictQuery", true);

  // 1. If already connected, reuse it!
  if (isConnected) {
    console.log("Using existing MongoDB connection ⚡");
    return;
  }

  // 2. Check current Mongoose state (0 = disconnected, 1 = connected)
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    console.log("MongoDB already connected (State 1) ⚡");
    return;
  }

  try {
    // 3. Create new connection
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("New MongoDB connection established 🌍");
  } catch (error) {
    console.error("Database connection error:", error);
    // Don't kill the process in serverless, just log it. 
    // The next request will try again.
  }
}

module.exports = { connectToDb };