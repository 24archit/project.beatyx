const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    unique: true,
    required: true,
  },
  youtubeLink: {
    type: String,
  },
  isError: {
    type: Boolean,
    default: false,
  },
});

const TrackDb = mongoose.model("Track", trackSchema);
module.exports = TrackDb;
