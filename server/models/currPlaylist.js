const mongoose = require("mongoose");
const currPlaylistSchema = new mongoose.Schema(
  {
    tracks: {
      type: Array,
      required: true,
    },
    playlistId: {
      type: String,
      required: true,
      unique: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 259200, // Document auto-deletes after 1 hour (3600 seconds)
    },
  },

  { timestamps: true }
);
const currPlaylist = mongoose.model("currPlaylist", currPlaylistSchema);
module.exports = currPlaylist;
