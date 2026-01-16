require("dotenv").config();
const axios = require("axios");
const TrackDb = require("../models/tracksDb");
async function getAudioLink(id) {
  try {
    let track = await TrackDb.findOne({ spotifyId: id });
    if (track) {
      const response = {
        url: track.youtubeLink,
      };
      return response;
    }

    const response = await axios({
      url: `${process.env.GET_AUDIO_LINK}${id}`,
    });

    const links = response.data.linksByPlatform;
    if (links.youtubeMusic) {
      await TrackDb.create({
        spotifyId: id,
        youtubeLink: links.youtubeMusic.url,
      });
      return links.youtubeMusic;
    }
    if (links.youtube) {
      await TrackDb.create({
        spotifyId: id,
        youtubeLink: links.youtube.url,
      });
      return links.youtube;
    }
    

    throw new Error("Track is not available on YouTube");
  } catch (error) {
    console.error("Error fetching the audio link:", error.message || error);
    return null; // Explicitly return null on error
  }
}

module.exports = { getAudioLink };