const mongoose = require("mongoose");

const trackSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
    unique: true, // Ensures spotifyId is unique
    required: true, // Ensures spotifyId is mandatory
  },
  youtubeLink: {
    type: String,
  },
});

const TrackDb = mongoose.model("Track", trackSchema);
module.exports = TrackDb;
