const express = require("express");
const router = express.Router();

// Import ALL the functions we need
const {
  getTopTracksIndia, 
  getTopTracksGlobal,
  getNewReleases,
  getFeaturedPlaylists,
  getCategories,
  getCategoryPlaylists
} = require("../utils/spotifyApis");

const setToken = require("../middlewares/setToken");

// 1. Top Tracks India
router.get("/api/getTopTracksIndia", setToken, async (req, res) => {
  try {
    const topTracks = await getTopTracksIndia(req.session.accessToken);
    res.json(topTracks);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

// 2. Top Tracks Global
router.get("/api/getTopTracksGlobal", setToken, async (req, res) => {
  try {
    const topTracks = await getTopTracksGlobal(req.session.accessToken);
    res.json(topTracks);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

// 3. New Releases
router.get("/api/getNewReleases", setToken, async (req, res) => {
  try {
    const data = await getNewReleases(req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error("New Releases Error:", error.message);
    res.status(400).json({ error: "Failed to fetch new releases" });
  }
});

// 4. Featured Playlists
router.get("/api/getFeaturedPlaylists", setToken, async (req, res) => {
  try {
    const data = await getFeaturedPlaylists(req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error("Featured Playlists Error:", error.message);
    res.status(400).json({ error: "Failed to fetch featured playlists" });
  }
});

// 5. Categories
router.get("/api/getCategories", setToken, async (req, res) => {
  try {
    const data = await getCategories(req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error("Categories Error:", error.message);
    res.status(400).json({ categories: { items: [] } });
  }
});

// 6. Category Playlists
router.get("/api/getCategoryPlaylists/:id", setToken, async (req, res) => {
  try {
    const { id } = req.params;
    const data = await getCategoryPlaylists(id, req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error(`Category Playlist Error (${req.params.id}):`, error.message);
    res.status(400).json({ playlists: { items: [] } });
  }
});

module.exports = router;