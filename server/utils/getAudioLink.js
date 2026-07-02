require("dotenv").config();
const axios = require("axios");
const TrackDb = require("../models/tracksDb");
const ytSearch = require("yt-search");
const { getAccessToken } = require("./getAccessToken");

async function getAudioLink(id) {
  try {
    let track = await TrackDb.findOne({ spotifyId: id });
    if (track) return { url: track.youtubeLink };

    let trackTitle = "";
    let artistName = "";

    try {
      const response = await axios({ url: `${process.env.GET_AUDIO_LINK}${id}` });
      const links = response.data.linksByPlatform || {};

      if (links.youtubeMusic) {
        await TrackDb.create({ spotifyId: id, youtubeLink: links.youtubeMusic.url });
        return links.youtubeMusic;
      }
      if (links.youtube) {
        await TrackDb.create({ spotifyId: id, youtubeLink: links.youtube.url });
        return links.youtube;
      }

      const entities = response.data.entitiesByUniqueId || {};
      const spotifyEntity = entities[`SPOTIFY_SONG::${id}`];
      if (spotifyEntity) {
        trackTitle = spotifyEntity.title;
        artistName = spotifyEntity.artistName ? spotifyEntity.artistName.split(",")[0] : "";
      }
    } catch (apiError) {
      console.warn(
        `[getAudioLink] Odesli API failed (${apiError.message}). Proceeding to full fallback...`
      );
    }

    if (!trackTitle) {
      try {
        const accessToken = await getAccessToken();
        const spotifyRes = await axios.get(`https://api.spotify.com/v1/tracks/${id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        trackTitle = spotifyRes.data.name;
        artistName =
          spotifyRes.data.artists && spotifyRes.data.artists.length > 0
            ? spotifyRes.data.artists[0].name
            : "";
      } catch (spotifyError) {
        console.error(
          `[getAudioLink] Failed to fetch metadata from Spotify: ${spotifyError.message}`
        );
      }
    }

    if (trackTitle) {
      const query = `${trackTitle} ${artistName} full audio`.trim();
      console.log(`[getAudioLink] Fallback searching YouTube for: "${query}"`);
      const searchResult = await ytSearch(query);

      if (searchResult && searchResult.videos.length > 0) {
        const topVideo = searchResult.videos[0];
        console.log(`[getAudioLink] Fallback success: Found "${topVideo.title}"`);
        await TrackDb.create({ spotifyId: id, youtubeLink: topVideo.url });
        return { url: topVideo.url };
      }
    }

    throw new Error("Track is not available on YouTube or via fallback search.");
  } catch (error) {
    console.error("Error fetching the audio link:", error.message || error);
    return null;
  }
}

module.exports = { getAudioLink };
