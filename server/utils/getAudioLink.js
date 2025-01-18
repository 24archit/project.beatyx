require("dotenv").config();
const axios = require("axios");

async function getAudioLink(id) {
  try {
    const response = await axios({
      url: `https://api.song.link/v1-alpha.1/links?url=open.spotify.com%2Ftrack%2F${id}`,
    });

    const links = response.data.linksByPlatform;

    if (links.youtubeMusic) {
      return links.youtubeMusic;
    }
    if (links.youtube) {
      return links.youtube;
    }

    throw new Error("Track is not available on YouTube");
  } catch (error) {
    console.error("Error fetching the audio link:", error.message || error);
    return null; // Explicitly return null on error
  }
}

module.exports = { getAudioLink };
