// server/routes/user.js
const express = require("express");
const router = express.Router();
const User = require("../models/user");
const verifyAuth = require("../middlewares/verifyAuth");
const { getCurrentUserInfo, getUserTopArtists, getUserTopTracks } = require("../utils/spotifyApis");
const { getSeveralTracks } = require("../utils/spotifyApis");
const currPlaylist = require("../models/currPlaylist");
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
router.put("/addLikedSong", verifyAuth, async (req, res) => {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ message: "Track ID required" });

    // Use $addToSet to ensure no duplicates
    await User.updateOne(
      { email: req.user.user.email },
      { $addToSet: { likedSongs: trackId } }
    );

    res.status(200).json({ message: "Added to Liked Songs" });
  } catch (error) {
    console.error("Error adding liked song:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Remove a song from liked list
router.put("/removeLikedSong", verifyAuth, async (req, res) => {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ message: "Track ID required" });

    await User.updateOne(
      { email: req.user.user.email },
      { $pull: { likedSongs: trackId } }
    );

    res.status(200).json({ message: "Removed from Liked Songs" });
  } catch (error) {
    console.error("Error removing liked song:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Get all liked songs (Robust Version)
router.get("/getLikedSongs", verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.user.email }).select("likedSongs");
    if (!user) return res.status(404).json({ message: "User not found" });

    const likedSongIds = user.likedSongs || [];
    let formattedTracks = [];

    // Only attempt to fetch details if there are IDs
    if (likedSongIds.length > 0) {
        try {
            // Spotify allows max 50 IDs per request
            const chunks = [];
            for (let i = 0; i < likedSongIds.length; i += 50) {
                chunks.push(likedSongIds.slice(i, i + 50));
            }

            const accessToken = req.session.accessToken;
            let allTracks = [];

            // Fetch all chunks
            const promises = chunks.map(chunk => {
                const ids = chunk.join(",");
                return getSeveralTracks(ids, accessToken);
            });

            const results = await Promise.all(promises);

            results.forEach(result => {
                if (result && result.tracks) {
                    allTracks = allTracks.concat(result.tracks);
                }
            });
            
            // Format for frontend & currPlaylist Schema
            formattedTracks = allTracks.map(track => ({ track }));
            
        } catch (fetchError) {
            console.error("Failed to fetch track details from Spotify:", fetchError.message);
        }
    }

    // --- NEW: Save to currPlaylist for Queue System ---
    // We create a unique ID for this user's liked songs list
    const playlistId = `liked_songs_${req.user.user.email}`;
    
    const playlistResult = await currPlaylist.findOneAndUpdate(
      { playlistId },
      { 
        tracks: formattedTracks,
        playlistId: playlistId 
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ 
        likedSongs: likedSongIds, 
        items: formattedTracks,
        currPlaylistId: playlistResult._id // Return the DB ID
    });

  } catch (error) {
    console.error("Error in getLikedSongs:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});
module.exports = router;