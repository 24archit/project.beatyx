const router = require("express").Router();
const { getPlaylist } = require("../utils/spotifyApis");
const currPlaylist = require("../models/currPlaylist");
const setToken = require("../middlewares/setToken");

/**
 * Fetches playlist information and updates the current playlist state.
 * @route GET /api/getPlaylistInfo/:playlistId
 */
router.get("/api/getPlaylistInfo/:playlistId", setToken, async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const playlist = await getPlaylist(playlistId, req.session.accessToken);

    if (!playlist) {
      throw new Error("Error fetching the playlist");
    }

    const result = await currPlaylist.findOneAndUpdate(
      { playlistId },
      { tracks: playlist.tracks.items },
      { upsert: true, new: true }
    );

    res.json({ playlist, currPlaylistId: result._id });
  } catch (error) {
    console.error("Error fetching playlist:", error.message);
    res.status(400).json({ error: "Not able to fetch playlist" });
  }
});

module.exports = router;
