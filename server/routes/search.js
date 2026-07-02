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
    const data = await getSearchResult(q, type, req.session.accessToken);
    res.send(data);
  })
);
module.exports = router;
