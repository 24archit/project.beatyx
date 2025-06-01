const currPlaylist = require("../models/currPlaylist");
const queueDb = require("../models/queue");

async function updatePlayerQueue(index, currPlaylistId, queueId = null) {
  try {
    // Fetch the playlist using findById (faster lookup)
    const playlist = await currPlaylist.findById(currPlaylistId).lean();

    if (!playlist) {
      throw new Error("Playlist not found");
    }

    const tracks = playlist.tracks;
    const queue = [...tracks.slice(index), ...tracks.slice(0, index)]; // Optimized queue rotation

    if (queueId) {
      // If queueId is provided, update the existing queue
      const updatedQueue = await queueDb.findByIdAndUpdate(
        queueId,
        { queue, currTrack: 0 },
        { new: true }
      );

      if (!updatedQueue) {
        throw new Error("Queue not found for update");
      }

      return updatedQueue._id;
    } else {
      // Create a new queue if queueId is not provided
      const newQueue = await queueDb.create({ queue, currTrack: 0 });
      return newQueue._id;
    }
  } catch (error) {
    throw new Error(`Error updating player queue: ${error.message}`);
  }
}

module.exports = { updatePlayerQueue };
