const router = require("express").Router();
const { getPlaylist } = require("../utils/spotifyApis");
const currPlaylist = require("../models/currPlaylist");

router.get("/api/getPlaylistInfo/:playlistId", async (req, res) => {
  try {
    const playlistId = req.params.playlistId;
    const playlist = await getPlaylist(playlistId);

    if (!playlist) {
      throw new Error("Error fetching the playlist");
    }

    const result = await currPlaylist.findOneAndUpdate(
      { playlistId }, // Ensure one document per playlist
      { tracks: playlist.tracks.items },
      { upsert: true, new: true } // Insert if not exists, update if exists
    );

    console.log("Created/Updated playlist entry:", result._id); // Debugging log
    res.json({ playlist, currPlaylistId: result._id });

  } catch (error) {
    console.error("Error fetching playlist:", error.message);
    res.status(400).json({ error: "Not able to fetch playlist" });
  }
});

module.exports = router;
