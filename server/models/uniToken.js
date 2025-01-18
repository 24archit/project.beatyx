const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  accessToken: {
    type: String,
  },
  updationTime: {
    type: Date
  }
});

const UniToken = mongoose.model("UniToken", tokenSchema);

module.exports = UniToken;
