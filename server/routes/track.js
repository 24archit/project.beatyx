// server/routes/track.js
const router = require("express").Router();
const { getTrack, getRecommendations, getArtistTopTracks } = require("../utils/spotifyApis");
const currPlaylist = require("../models/currPlaylist");
const setToken = require("../middlewares/setToken");

router.get("/api/getTrackInfo/:id", setToken, async (req, res) => {
  try {
    const trackId = req.params.id;
    const accessToken = req.session.accessToken;

    // 1. Fetch Track Details
    const trackData = await getTrack(trackId, accessToken);
    if (!trackData) {
      throw new Error("Track not found");
    }

    const artistId = trackData.artists[0]?.id;
    let recommendations = [];

    // 2. Try fetching Recommendations
    try {
      if (artistId) {
        const recData = await getRecommendations(trackId, artistId, accessToken);
        recommendations = recData.tracks || [];
      }
    } catch (recError) {
      console.warn("Recommendations failed, falling back to Artist Top Tracks:", recError.message);
    }

    // 3. Fallback: If no recommendations, fetch Artist Top Tracks
    if (recommendations.length === 0 && artistId) {
      try {
        const topTracksData = await getArtistTopTracks(artistId, accessToken);
        // Filter out the current track from the top tracks
        recommendations = (topTracksData.tracks || []).filter(t => t.id !== trackId);
      } catch (fallbackError) {
        console.error("Fallback to Artist Top Tracks also failed:", fallbackError.message);
      }
    }

    // 4. Format for the player (wrap in { track: ... } object)
    const formattedTracks = recommendations.map(track => ({ track }));

    // 5. Save to currPlaylist so they can be played as a queue
    const playlistId = `track_radio_${trackId}`;
    const result = await currPlaylist.findOneAndUpdate(
      { playlistId },
      { tracks: formattedTracks },
      { upsert: true, new: true }
    );

    res.json({
      track: trackData,
      recommendations: formattedTracks,
      currPlaylistId: result._id
    });

  } catch (error) {
    console.error("Error in getTrackInfo:", error.message);
    res.status(400).json({ error: "Unable to fetch track info" });
  }
});

module.exports = router;