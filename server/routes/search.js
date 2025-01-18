const express = require("express");
const router = express.Router();
const { getSearchResult } = require("../utils/spotifyApis");

router.get("/api/getSearchResult", async (req, res) => {
  const { q, type } = req.query;
  try {
    const data = await getSearchResult(q, type);
    res.send(data);
  } catch (error) {
    res.status(400).send(error.message);
  }
});
module.exports = router;
