const express = require("express");
const router = express.Router();
const { updatePlayerQueue } = require("../utils/setQueue");
const { getAudioLink } = require("../utils/getAudioLink");
const { getNextAudioLink } = require("../utils/getNextAudioLink");
const { getPreviousAudioLink } = require("../utils/getPreviousAudioLink");
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
router.put("/api/updatePlayerQueue", async (req, res) => {
  try {
    const {index, currPlaylistId, queueId} = req.body;
    const newQueueId = await updatePlayerQueue(index, currPlaylistId, queueId);
    res.json({ message: "Player Queue Updated", queueId: newQueueId });
  } catch (error) {
    res.status(400).json({ error: "Not able to update player queue" });
  }
});
router.get("/api/getNextAudioLink/:queueId", async (req, res) => {
  try {
    const queueId = req.params.queueId;
    const trackInfo = await getNextAudioLink(queueId);
    if (trackInfo == null) {
      throw new error("Error to fetch the audio link");
    }
    res.json(trackInfo);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch audio Link" });
  }
});
router.get("/api/getPreviousAudioLink/:queueId", async (req, res) => {
  try {
    const queueId = req.params.queueId;
    const trackInfo = await getPreviousAudioLink(queueId);
    if (trackInfo == null) {
      throw new error("Error to fetch the audio link");
    }
    res.json(trackInfo);
  } catch (error) {
    res.status(400).json({ error: "Not able to fetch audio Link" });
  }
});

module.exports = router;
