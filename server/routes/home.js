const express = require("express");
const router = express.Router();

const {getTopTracksIndia, getTopTracksGlobal} = require("../utils/spotifyApis")

router.get("/api/getTopTracksIndia", async (req, res) => {
  try {
    const topTracks = await getTopTracksIndia(req);
    res.json(topTracks);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

router.get("/api/getTopTracksGlobal", async (req, res) => {
  try {
    const topTracks = await getTopTracksGlobal(req);
    res.json(topTracks);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

module.exports = router;