const express = require("express");
const router = express.Router();
const { getArtistInfo } = require("../utils/spotifyApis");
const { getArtistShows } = require("../utils/getArtistShows");
const setToken = require("../middlewares/setToken");
const withTokenRetry = require("../middlewares/withTokenRetry");

router.get(
  "/api/getArtistInfo/:artistId",
  setToken,
  withTokenRetry(async (req, res) => {
    const artistId = req.params.artistId;
    const artistInfo = await getArtistInfo(artistId, req.session.accessToken);
    res.json(artistInfo);
  })
);
router.get(
  "/api/getArtistShows/:artistId",
  setToken,
  withTokenRetry(async (req, res) => {
    const artistId = req.params.artistId;
    const artistShows = await getArtistShows(artistId, req.session.accessToken);
    res.json(artistShows);
  })
);

router.get(
  "/api/getArtistAlbums/:artistId",
  setToken,
  withTokenRetry(async (req, res) => {
    const artistId = req.params.artistId;
    const limit = req.query.limit || 8;
    const offset = req.query.offset || 0;
    const { getArtistAlbums } = require("../utils/spotifyApis");
    const albums = await getArtistAlbums(artistId, limit, offset, req.session.accessToken);
    res.json(albums);
  })
);

module.exports = router;
