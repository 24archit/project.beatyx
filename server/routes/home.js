const express = require("express");
const router = express.Router();
const cache = require("../utils/cache");
const {
  getTopTracksIndia,
  getTopTracksGlobal,
  getNewReleases,
  getFeaturedPlaylists,
  getCategories,
  getCategoryPlaylists,
} = require("../utils/spotifyApis");

const setToken = require("../middlewares/setToken");

/**
 * Fetches top tracks in India, serving from cache if available.
 * @route GET /api/getTopTracksIndia
 */
router.get("/api/getTopTracksIndia", setToken, async (req, res) => {
  try {
    const cacheKey = "top-tracks-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const topTracks = await getTopTracksIndia(req.session.accessToken);
    cache.set(cacheKey, topTracks);
    res.json(topTracks);
  } catch {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

/**
 * Fetches top tracks globally, serving from cache if available.
 * @route GET /api/getTopTracksGlobal
 */
router.get("/api/getTopTracksGlobal", setToken, async (req, res) => {
  try {
    const cacheKey = "top-tracks-global";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const topTracks = await getTopTracksGlobal(req.session.accessToken);
    cache.set(cacheKey, topTracks);
    res.json(topTracks);
  } catch {
    res.status(400).json({ error: "Not able to fetch data from Spotify" });
  }
});

/**
 * Fetches new releases, serving from cache if available.
 * @route GET /api/getNewReleases
 */
router.get("/api/getNewReleases", setToken, async (req, res) => {
  try {
    const cacheKey = "new-releases-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const data = await getNewReleases(req.session.accessToken);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("New Releases Error:", error.message);
    res.status(400).json({ error: "Failed to fetch new releases" });
  }
});

/**
 * Fetches featured playlists, serving from cache if available.
 * @route GET /api/getFeaturedPlaylists
 */
router.get("/api/getFeaturedPlaylists", setToken, async (req, res) => {
  try {
    const cacheKey = "features-playlists-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await getFeaturedPlaylists(req.session.accessToken);
    cache.set(cacheKey, data);
    res.json(data);
  } catch (error) {
    console.error("Featured Playlists Error:", error.message);
    res.status(400).json({ error: "Failed to fetch featured playlists" });
  }
});

/**
 * Fetches browsing categories.
 * @route GET /api/getCategories
 */
router.get("/api/getCategories", setToken, async (req, res) => {
  try {
    const data = await getCategories(req.session.accessToken);
    res.json(data);
  } catch (error) {
    console.error("Categories Error:", error.message);
    res.status(400).json({ categories: { items: [] } });
  }
});

/**
 * Fetches playlists for a specific category.
 * @route GET /api/getCategoryPlaylists/:id
 */
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
