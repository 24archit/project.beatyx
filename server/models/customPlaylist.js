const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  id: { type: String, required: true, maxlength: 30, match: /^[A-Za-z0-9]{22}$/ },
  trackName: { type: String, required: true, maxlength: 300 },
  artists: [
    {
      name: { type: String, maxlength: 200 },
      id: { type: String, maxlength: 30 },
      spotifyUrl: { type: String, maxlength: 200 },
    },
  ],
  imgSrc: { type: String, maxlength: 500 }, // URL, not embedded image
  duration: { type: Number, min: 0, max: 7200000 }, // Max 2 hours in ms
  spotifyUrl: { type: String, maxlength: 200 },
  addedAt: { type: Date, default: Date.now },
});

const customPlaylistSchema = new mongoose.Schema(
  {
    _id: {
      type: String, // We will manually set this to 'btx_<uuid>'
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    tracks: {
      type: [trackSchema],
      validate: [(arr) => arr.length <= 500, "Playlist track limit is 500"],
    },
    snapshotId: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Middleware to update snapshotId before saving if tracks were modified
customPlaylistSchema.pre("save", function (next) {
  if (
    this.isModified("tracks") ||
    this.isModified("name") ||
    this.isModified("description") ||
    this.isModified("isPublic")
  ) {
    this.snapshotId = "snapshot_" + Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
  next();
});

customPlaylistSchema.index({ ownerId: 1 });

const CustomPlaylist = mongoose.model("CustomPlaylist", customPlaylistSchema);

module.exports = CustomPlaylist;
