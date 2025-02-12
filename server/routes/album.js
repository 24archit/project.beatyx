const express = require("express");
const router = express.Router();
const { getAlbum } = require("../utils/spotifyApis");

router.get("/api/getAlbumInfo/:albumId", async (req, res) => {
    try {
        const albumId = req.params.albumId;
        const album = await getAlbum(albumId);
        if (album == null) {
          throw new Error("Error to fetch the album");
        }
        res.json(album);
      } catch (error) {
        res.status(400).json({ error: "Not able to fetch album" });
      }
});

module.exports = router;