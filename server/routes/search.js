const express = require("express");
const router = express.Router();
const { getSearchResult } = require("../utils/spotifyApis");
const setToken = require("../middlewares/setToken");

router.get("/api/getSearchResult", setToken, async (req, res) => {
  const { q, type } = req.query;
  try {
    const data = await getSearchResult(q, type, req.session.accessToken);
    res.send(data);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = router;
