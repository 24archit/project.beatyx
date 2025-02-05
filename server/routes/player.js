const express = require("express");
const router = express.Router();
const { getAudioLink } = require("../utils/getAudioLink");

router.get("/api/getAudioLink/:trackId", async (req, res) => {
  try {
    const trackId = req.params.trackId;
    const audioLink = await getAudioLink(trackId);
    if (audioLink == null) {
      throw new error("Error to fetch the audio link");
    }
    res.json(audioLink);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch audio Link" });
  }
});

module.exports = router;
