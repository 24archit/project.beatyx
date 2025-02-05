const mongoose = require("mongoose");
const trackSchema = new mongoose.Schema({
  spotifyId: {
    type: String,
  },
  youtubeLink: {
    type: String,
  },
});

const TrackDb = mongoose.model("Track", trackSchema);
module.exports = TrackDb;
