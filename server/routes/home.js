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
const withTokenRetry = require("../middlewares/withTokenRetry");
/**
 * Fetches top tracks in India, serving from cache if available.
 * @route GET /api/getTopTracksIndia
 */
router.get(
  "/api/getTopTracksIndia",
  setToken,
  withTokenRetry(async (req, res) => {
    const cacheKey = "top-tracks-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const topTracks = await getTopTracksIndia(req.session.accessToken);
    cache.set(cacheKey, topTracks);
    res.json(topTracks);
  })
);

/**
 * Fetches top tracks globally, serving from cache if available.
 * @route GET /api/getTopTracksGlobal
 */
router.get(
  "/api/getTopTracksGlobal",
  setToken,
  withTokenRetry(async (req, res) => {
    const cacheKey = "top-tracks-global";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const topTracks = await getTopTracksGlobal(req.session.accessToken);
    cache.set(cacheKey, topTracks);
    res.json(topTracks);
  })
);

/**
 * Fetches new releases, serving from cache if available.
 * @route GET /api/getNewReleases
 */
router.get(
  "/api/getNewReleases",
  setToken,
  withTokenRetry(async (req, res) => {
    const cacheKey = "new-releases-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }
    const data = await getNewReleases(req.session.accessToken);
    cache.set(cacheKey, data);
    res.json(data);
  })
);

/**
 * Fetches featured playlists, serving from cache if available.
 * @route GET /api/getFeaturedPlaylists
 */
router.get(
  "/api/getFeaturedPlaylists",
  setToken,
  withTokenRetry(async (req, res) => {
    const cacheKey = "features-playlists-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const data = await getFeaturedPlaylists(req.session.accessToken);
    cache.set(cacheKey, data);
    res.json(data);
  })
);

/**
 * Fetches browsing categories.
 * @route GET /api/getCategories
 */
router.get(
  "/api/getCategories",
  setToken,
  withTokenRetry(async (req, res) => {
    const data = await getCategories(req.session.accessToken);
    res.json(data);
  })
);

/**
 * Fetches playlists for a specific category.
 * @route GET /api/getCategoryPlaylists/:id
 */
router.get(
  "/api/getCategoryPlaylists/:id",
  setToken,
  withTokenRetry(async (req, res) => {
    const { id } = req.params;
    const data = await getCategoryPlaylists(id, req.session.accessToken);
    res.json(data);
  })
);

module.exports = router;
