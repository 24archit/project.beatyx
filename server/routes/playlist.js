const router = require("express").Router();
const { getPlaylist } = require("../utils/spotifyApis");

router.get("/api/getPlaylistInfo/:playlistId", async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const playlist = await getPlaylist(playlistId);
    if (playlist == null) {
      throw new Error("Error to fetch the playlist");
    }
    res.json(playlist);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch playlist" });
  }
});

module.exports = router;