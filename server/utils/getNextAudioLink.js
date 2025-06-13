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

    // If currTrack is at the last index, return the last track’s audio link.
    if (currTrack + 1 >= queue.queue.length) {
      const lastTrackId = queue.queue[currTrack].track.id;
      return await getAudioLink(lastTrackId);
    }

    while (attempts < 6) {
      const nextTrack = queue.queue[currTrack + 1];
      if (!nextTrack) {
        throw new Error("No more tracks in the queue");
      }

      // Increment the current track pointer
      await QueueDb.updateOne(
        { _id: queueId },
        { $inc: { currTrack: 1 } }
      ).exec();
      currTrack++;

      const nextTrackId = nextTrack.track.id;
      const trackName= nextTrack.track.name ? nextTrack.track.name : null;
      const trackImg = nextTrack.track.album.images[0].url ? nextTrack.track.album.images[0].url : null;
      audioLink = await getAudioLink(nextTrackId);

      if (audioLink) {
        const trackInfo={
          trackName: trackName,
          imgSrc: trackImg,
          audioLink: audioLink,
          artistNames: nextTrack.track.artists || ["Unknown Artist"]
        }
        return trackInfo;
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
    return null; // Explicitly return null on error
  }
}

module.exports = { getNextAudioLink };
