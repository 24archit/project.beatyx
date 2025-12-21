const mongoose = require("mongoose");

const uniTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  expiresIn: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now } // <--- MAKE SURE THIS LINE EXISTS
});

module.exports = mongoose.model("UniToken", uniTokenSchema);