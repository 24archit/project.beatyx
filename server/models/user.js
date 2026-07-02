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
    lowercase: true,
    trim: true,
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
    validate: [(arr) => arr.length <= 5000, "Liked songs limit exceeded"],
  },
  followedArtists: {
    type: [String],
    default: [],
    validate: [(arr) => arr.length <= 5000, "Followed artists limit exceeded"],
  },
  savedPlaylists: {
    type: [String], // Array of 'btx_...' custom playlist IDs or Spotify Playlist IDs
    default: [],
    validate: [(arr) => arr.length <= 5000, "Saved playlists limit exceeded"],
  },
  savedAlbums: {
    type: [String], // Array of Spotify Album IDs
    default: [],
    validate: [(arr) => arr.length <= 5000, "Saved albums limit exceeded"],
  },
});

userSchema.index({ email: 1 });
userSchema.index({ spotifyId: 1 }, { sparse: true });

const User = mongoose.model("User", userSchema);

module.exports = User;
