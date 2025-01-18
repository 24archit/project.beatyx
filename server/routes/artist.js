const express = require("express");
const router = express.Router();
const {getArtistInfo} = require("../utils/spotifyApis");

router.get("/api/getArtistInfo/:artistId", async (req, res) => {
  try {
    const artistId = req.params.artistId;
    const artistInfo = await getArtistInfo(artistId);
    res.json(artistInfo);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

module.exports = router;