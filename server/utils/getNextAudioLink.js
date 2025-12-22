// server/utils/getNextAudioLink.js
const QueueDb = require("../models/queue");
const { getAudioLink } = require("../utils/getAudioLink");

async function getNextAudioLink(queueId) {
  try {
    const queue = await QueueDb.findOne({ _id: queueId }).exec();
    if (!queue) {
      throw new Error("Queue is empty");
    }

    let currTrack = queue.currTrack;
    let attempts = 0;
    let audioLink = null;

    // CASE 1: End of Queue - Replay Last Track
    if (currTrack + 1 >= queue.queue.length) {
      const lastTrack = queue.queue[currTrack];
      const lastTrackId = lastTrack.track.id;
      
      // Fetch audio
      audioLink = await getAudioLink(lastTrackId);

      if (audioLink) {
        return {
          id: lastTrackId,
          trackName: lastTrack.track.name || "Unknown Track",
          imgSrc: lastTrack.track.album.images[0]?.url || "",
          audioLink: audioLink, // Nested here correctly
          artistNames: lastTrack.track.artists 
            ? lastTrack.track.artists.map(a => a.name) 
            : ["Unknown Artist"]
        };
      }
      return null;
    }

    // CASE 2: Next Track in Queue
    while (attempts < 6) {
      const nextTrack = queue.queue[currTrack + 1];
      if (!nextTrack) {
        throw new Error("No more tracks in the queue");
      }

      // Update Database pointer
      await QueueDb.updateOne(
        { _id: queueId },
        { $inc: { currTrack: 1 } }
      ).exec();
      currTrack++;

      const nextTrackId = nextTrack.track.id;
      const trackName = nextTrack.track.name || "Unknown Track";
      const trackImg = nextTrack.track.album.images[0]?.url || "";

      // Fetch audio
      audioLink = await getAudioLink(nextTrackId);

      if (audioLink) {
        return {
          id: nextTrackId, // ID explicitly included
          trackName: trackName,
          imgSrc: trackImg,
          audioLink: audioLink,
          artistNames: nextTrack.track.artists 
            ? nextTrack.track.artists.map(a => a.name) 
            : ["Unknown Artist"]
        };
      }

      attempts++;
      console.warn(
        `Attempt ${attempts}: Failed to fetch audio link for track ID ${nextTrackId}. Retrying...`
      );
    }

    throw new Error("Failed to fetch a valid audio link after 6 attempts");
  } catch (error) {
    console.error(
      "Error fetching the next audio link:",
      error.message || error
    );
    return null;
  }
}

module.exports = { getNextAudioLink };