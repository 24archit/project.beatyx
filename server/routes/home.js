const express = require("express");
const router = express.Router();

const {getTopTracksIndia, getTopTracksGlobal, getNewReleases, getFeaturedPlaylists, getRecentlyPlayed, getCategories, getCategoryPlaylists} = require("../utils/spotifyApis");
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

router.get("/api/getNewReleases", setToken, async (req, res) => {
  try {
    const newReleases = await getNewReleases(req.session.accessToken);
    res.json(newReleases);
  } catch (error) {
    console.error("Error fetching new releases:", error);
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});
router.get("/api/getFeaturedPlaylists", setToken, async (req, res) => {
  try {
    const playlists = await getFeaturedPlaylists(req.session.accessToken);
    res.json(playlists);
  } catch (error) {
    console.error("Error fetching featured playlists:", error);
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

router.get("/api/getCategories", setToken, async (req, res) => {
  try {
    const data = await getCategories(req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    res.json({ categories: { items: [] } });
  }
});
router.get("/api/getCategoryPlaylists/:id", setToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getCategoryPlaylists(id, req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error(`Error fetching category ${req.params.id}:`, error.message);
    res.status(400).json({ error: "Failed to fetch category playlists" });
  }
});
module.exports = router;