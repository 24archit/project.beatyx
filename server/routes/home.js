const express = require("express");
const router = express.Router();

const {getTopTracksIndia, getTopTracksGlobal} = require("../utils/spotifyApis");
const setToken = require("../middlewares/setToken");

router.get("/api/getTopTracksIndia", setToken, async (req, res) => {
  try {
    const topTracks = await getTopTracksIndia(req.session.accessToken);
    res.json(topTracks);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

router.get("/api/getTopTracksGlobal", setToken, async (req, res) => {
  try {
    const topTracks = await getTopTracksGlobal(req.session.accessToken);
    res.json(topTracks);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

module.exports = router;