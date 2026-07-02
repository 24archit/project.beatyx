const express = require("express");
const router = express.Router();
const { getAudioLink } = require("../utils/getAudioLink");

router.get("/api/getAudioLink/:trackId", async (req, res) => {
  try {
    const trackId = req.params.trackId;
    const audioLink = await getAudioLink(trackId);
    if (audioLink == null) {
      throw new Error("Error to fetch the audio link");
    }
    res.json(audioLink);
  } catch {
    res.status(404).json({ error: "Audio link not found for this track" });
  }
});

module.exports = router;
