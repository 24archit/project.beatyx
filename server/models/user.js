// server/models/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  displayName: {
    type: String,
    required: true,
  },
  country: {
    type: String,
  },
  spotify_url: {
    type: String,
  },
  spotifyId: {
    type: String,
    default: "",
  },
  profilePic: {
    type: String,
  },
  spotifyAccountType: {
    type: String,
  },
  followers: {
    type: Number,
    default: 0,
  },
  accessToken: {
    type: String,
    default: "",
  },
  refreshToken: {
    type: String,
    default: "",
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  updationTime: {
    type: Date,
  },
  password: {
    type: String,
    required: true,
  },
  likedSongs: {
    type: [String],
    default: [],
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
