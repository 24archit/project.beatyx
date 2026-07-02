const express = require("express");
const router = express.Router();
const { getAlbum } = require("../utils/spotifyApis");
const setToken = require("../middlewares/setToken");
const withTokenRetry = require("../middlewares/withTokenRetry");

router.get(
  "/api/getAlbumInfo/:albumId",
  setToken,
  withTokenRetry(async (req, res) => {
    const albumId = req.params.albumId;
    const album = await getAlbum(albumId, req.session.accessToken);
    if (album == null) {
      throw new Error("Error to fetch the album");
    }
    res.json(album);
  })
);

module.exports = router;
