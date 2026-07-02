const router = require("express").Router();
const { getPlaylist, getPlaylistTracks } = require("../utils/spotifyApis");
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
/**
 * Fetches playlist tracks with pagination.
 * @route GET /api/getPlaylistTracks/:playlistId
 */
router.get(
  "/api/getPlaylistTracks/:playlistId",
  setToken,
  withTokenRetry(async (req, res) => {
    const playlistId = req.params.playlistId;
    const limit = req.query.limit || 50;
    const offset = req.query.offset || 0;
    const tracks = await getPlaylistTracks(playlistId, limit, offset, req.session.accessToken);

    if (!tracks) {
      throw new Error("Error fetching playlist tracks");
    }

    res.json({ tracks });
  })
);

module.exports = router;
