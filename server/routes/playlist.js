const router = require("express").Router();
const { getPlaylist } = require("../utils/spotifyApis");
const setToken = require("../middlewares/setToken");
const withTokenRetry = require("../middlewares/withTokenRetry");

/**
 * Fetches playlist information and updates the current playlist state.
 * @route GET /api/getPlaylistInfo/:playlistId
 */
router.get(
  "/api/getPlaylistInfo/:playlistId",
  setToken,
  withTokenRetry(async (req, res) => {
    const playlistId = req.params.playlistId;
    const playlist = await getPlaylist(playlistId, req.session.accessToken);

    if (!playlist) {
      throw new Error("Error fetching the playlist");
    }

    res.json({ playlist });
  })
);

module.exports = router;
