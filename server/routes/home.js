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
  getSeveralArtists,
  getUserTopArtists,
  getUserTopTracks,
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

/**
 * Fetches trending artists by extracting them from global/india top tracks.
 * @route GET /api/getTrendingArtists
 */
router.get(
  "/api/getTrendingArtists",
  setToken,
  withTokenRetry(async (req, res) => {
    const cacheKey = "trending-artists";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const topTracks = await getTopTracksGlobal(req.session.accessToken);
      const artists = new Map();

      // Extract unique artists from top tracks
      if (topTracks?.tracks?.items) {
        topTracks.tracks.items.forEach((item) => {
          if (item.track && item.track.artists) {
            item.track.artists.forEach((artist) => {
              if (!artists.has(artist.id)) {
                artists.set(artist.id, artist);
              }
            });
          }
        });
      }

      // Get up to 20 artist IDs
      const artistIds = Array.from(artists.keys()).slice(0, 20).join(",");

      if (artistIds.length > 0) {
        const data = await getSeveralArtists(artistIds, req.session.accessToken);
        cache.set(cacheKey, data, 3600); // cache for 1 hour
        return res.json(data);
      }

      res.json({ artists: [] });
    } catch (error) {
      console.error("Failed to fetch trending artists:", error);
      res.status(500).json({ error: "Failed to fetch trending artists" });
    }
  })
);

/**
 * Fetches trending artists in India by extracting them from india top tracks.
 * @route GET /api/getTrendingArtistsIndia
 */
router.get(
  "/api/getTrendingArtistsIndia",
  setToken,
  withTokenRetry(async (req, res) => {
    const cacheKey = "trending-artists-india";
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    try {
      const topTracks = await getTopTracksIndia(req.session.accessToken);
      const artists = new Map();

      // Extract unique artists from top tracks
      if (topTracks?.tracks?.items) {
        topTracks.tracks.items.forEach((item) => {
          if (item.track && item.track.artists) {
            item.track.artists.forEach((artist) => {
              if (!artists.has(artist.id)) {
                artists.set(artist.id, artist);
              }
            });
          }
        });
      }

      // Get up to 20 artist IDs
      const artistIds = Array.from(artists.keys()).slice(0, 20).join(",");

      if (artistIds.length > 0) {
        const data = await getSeveralArtists(artistIds, req.session.accessToken);
        cache.set(cacheKey, data, 3600); // cache for 1 hour
        return res.json(data);
      }

      res.json({ artists: [] });
    } catch (error) {
      console.error("Failed to fetch trending artists india:", error);
      res.status(500).json({ error: "Failed to fetch trending artists india" });
    }
  })
);

/**
 * Fetches user's personalized top artists and tracks.
 * @route GET /api/getUserTopItems
 */
router.get(
  "/api/getUserTopItems",
  setToken,
  withTokenRetry(async (req, res) => {
    try {
      const [topArtists, topTracks] = await Promise.all([
        getUserTopArtists(req.session.accessToken),
        getUserTopTracks(req.session.accessToken),
      ]);
      res.json({ topArtists, topTracks });
    } catch (error) {
      console.error("Failed to fetch user top items:", error);
      res.status(500).json({ error: "Failed to fetch user top items" });
    }
  })
);

module.exports = router;
