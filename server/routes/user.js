// server/routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const verifyAuth = require("../middlewares/verifyAuth");
const { getCurrentUserInfo, getUserTopArtists, getUserTopTracks } = require("../utils/spotifyApis");

router.get("/profile", verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.user.email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let spotifyData = { isConnected: false };

    if (user.refreshToken) {
      try {
        const accessToken = req.session.accessToken;
        if (accessToken) {
            const [spotifyProfile, topArtists, topTracks] = await Promise.all([
                getCurrentUserInfo(accessToken),
                getUserTopArtists(accessToken),
                getUserTopTracks(accessToken)
            ]);

            // SAFE GUARD: Ensure .items exists, otherwise default to []
            const safeTopArtists = (topArtists && topArtists.items) ? topArtists.items : [];
            const safeTopTracks = (topTracks && topTracks.items) ? topTracks.items : [];

            spotifyData = {
                isConnected: true,
                profile: spotifyProfile,
                topArtists: safeTopArtists, // Send safe array
                topTracks: safeTopTracks    // Send safe array
            };
        }
      } catch (spotifyError) {
        console.error("Spotify Sync Error:", spotifyError.message);
        // If sync fails, send isConnected: false so frontend doesn't try to render data
        spotifyData = { isConnected: false, error: "Sync failed" };
      }
    }

    res.status(200).json({
      user: user,
      spotify: spotifyData
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;