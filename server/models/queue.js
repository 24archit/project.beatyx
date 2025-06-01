const mongoose = require("mongoose");

const queueSchema = new mongoose.Schema(
  {
    queue: {
      type: Array,
      required: true,
    },
    currTrack: {
      type: Number,
      required: true,
    },
    isLooping: {
      type: Boolean,
      default: false,
    },
    isShuffling: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 259200, // Document auto-deletes after 1 hour (3600 seconds)
    },
  },
  { timestamps: true }
);

const QueueDb = mongoose.model("Queue", queueSchema);
module.exports = QueueDb;
