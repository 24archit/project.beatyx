const express = require("express");
const router = express.Router();
const { getSearchResult } = require("../utils/spotifyApis");
const setToken = require("../middlewares/setToken");
const withTokenRetry = require("../middlewares/withTokenRetry");

router.get(
  "/api/getSearchResult",
  setToken,
  withTokenRetry(async (req, res) => {
    const { q, type } = req.query;

    // Validate required params
    if (!q || typeof q !== "string" || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }
    if (q.length > 200) {
      return res.status(400).json({ error: "Search query too long" });
    }

    // Allowlist valid type values
    const VALID_TYPES = ["track", "artist", "album", "playlist", "episode", "show"];
    const typeList = (type || "track").split(",");
    if (!typeList.every((t) => VALID_TYPES.includes(t))) {
      return res.status(400).json({ error: "Invalid search type" });
    }

    // Clamp numeric inputs
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 9, 1), 50);
    const offset = Math.min(Math.max(parseInt(req.query.offset) || 0, 0), 1000);

    const data = await getSearchResult(
      q,
      typeList.join(","),
      limit,
      offset,
      req.session.accessToken
    );
    res.send(data);
  })
);
module.exports = router;
