const express = require("express");
const router = express.Router();
const User = require("../models/user");
const verifyAuth = require("../middlewares/verifyAuth");
const {
  getCurrentUserInfo,
  getUserTopArtists,
  getUserTopTracks,
  getUserSavedTracks,
  getUserPlaylists,
  getUserSavedAlbums,
  getUserFollowedArtists,
} = require("../utils/spotifyApis");
const { getSeveralTracks } = require("../utils/spotifyApis");
const currPlaylist = require("../models/currPlaylist");
router.get("/profile", verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.user.email }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let spotifyData = { isConnected: false };

    if (req.user.user.spotifyConnect) {
      try {
        const accessToken = req.session.accessToken;
        if (accessToken) {
          const [
            spotifyProfile,
            topArtists,
            topTracks,
            savedTracks,
            playlists,
            savedAlbums,
            followedArtists,
          ] = await Promise.all([
            getCurrentUserInfo(accessToken),
            getUserTopArtists(accessToken),
            getUserTopTracks(accessToken),
            getUserSavedTracks(accessToken),
            getUserPlaylists(accessToken),
            getUserSavedAlbums(accessToken),
            getUserFollowedArtists(accessToken),
          ]);

          const safeTopArtists = topArtists && topArtists.items ? topArtists.items : [];
          const safeTopTracks = topTracks && topTracks.items ? topTracks.items : [];
          const safeSavedTracks = savedTracks && savedTracks.items ? savedTracks.items : [];
          const safePlaylists = playlists && playlists.items ? playlists.items : [];
          const safeSavedAlbums = savedAlbums && savedAlbums.items ? savedAlbums.items : [];
          const safeFollowedArtists =
            followedArtists && followedArtists.artists && followedArtists.artists.items
              ? followedArtists.artists.items
              : [];

          spotifyData = {
            isConnected: true,
            profile: spotifyProfile,
            topArtists: safeTopArtists,
            topTracks: safeTopTracks,
            savedTracks: safeSavedTracks,
            playlists: safePlaylists,
            savedAlbums: safeSavedAlbums,
            followedArtists: safeFollowedArtists,
          };
        }
      } catch (spotifyError) {
        console.error("Spotify Sync Error:", spotifyError.message);
        spotifyData = { isConnected: false, error: "Sync failed" };
      }
    }

    res.status(200).json({
      user: user,
      spotify: spotifyData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/profile-update", verifyAuth, async (req, res) => {
  try {
    const { displayName, profilePic } = req.body;
    const updateData = {};
    if (displayName) updateData.displayName = displayName;
    if (profilePic) updateData.profilePic = profilePic;

    await User.updateOne({ email: req.user.user.email }, { $set: updateData });

    res.status(200).json({ success: true, message: "Profile updated successfully." });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.put("/addLikedSong", verifyAuth, async (req, res) => {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ message: "Track ID required" });

    await User.updateOne({ email: req.user.user.email }, { $addToSet: { likedSongs: trackId } });

    res.status(200).json({ message: "Added to Liked Songs" });
  } catch (error) {
    console.error("Error adding liked song:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/removeLikedSong", verifyAuth, async (req, res) => {
  try {
    const { trackId } = req.body;
    if (!trackId) return res.status(400).json({ message: "Track ID required" });

    await User.updateOne({ email: req.user.user.email }, { $pull: { likedSongs: trackId } });

    res.status(200).json({ message: "Removed from Liked Songs" });
  } catch (error) {
    console.error("Error removing liked song:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/getLikedSongs", verifyAuth, async (req, res) => {
  try {
    const user = await User.findOne({ email: req.user.user.email }).select("likedSongs");
    if (!user) return res.status(404).json({ message: "User not found" });

    const likedSongIds = user.likedSongs || [];
    let formattedTracks = [];

    if (likedSongIds.length > 0) {
      try {
        const chunks = [];
        for (let i = 0; i < likedSongIds.length; i += 50) {
          chunks.push(likedSongIds.slice(i, i + 50));
        }

        const accessToken = req.session.accessToken;
        let allTracks = [];

        const promises = chunks.map((chunk) => {
          const ids = chunk.join(",");
          return getSeveralTracks(ids, accessToken);
        });

        const results = await Promise.all(promises);

        results.forEach((result) => {
          if (result && result.tracks) {
            allTracks = allTracks.concat(result.tracks);
          }
        });

        formattedTracks = allTracks.map((track) => ({ track }));
      } catch (fetchError) {
        console.error("Failed to fetch track details from Spotify:", fetchError.message);
      }
    }

    const playlistId = `liked_songs_${req.user.user.email}`;

    const playlistResult = await currPlaylist.findOneAndUpdate(
      { playlistId },
      {
        tracks: formattedTracks,
        playlistId: playlistId,
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      likedSongs: likedSongIds,
      items: formattedTracks,
      currPlaylistId: playlistResult._id,
    });
  } catch (error) {
    console.error("Error in getLikedSongs:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

router.put("/disconnect-spotify", verifyAuth, async (req, res) => {
  try {
    await User.updateOne(
      { email: req.user.user.email },
      {
        $set: {
          accessToken: "",
          refreshToken: "",
          spotifyId: "",
          spotify_url: "",
          spotifyAccountType: "",
        },
      }
    );
    res.status(200).json({ success: true, message: "Spotify disconnected successfully." });
  } catch (error) {
    console.error("Error disconnecting Spotify:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

router.delete("/account", verifyAuth, async (req, res) => {
  try {
    const email = req.user.user.email;
    await User.deleteOne({ email });
    // Cleanup playlists (liked songs)
    const playlistId = `liked_songs_${email}`;
    await currPlaylist.deleteOne({ playlistId });

    res.status(200).json({ success: true, message: "Account deleted successfully." });
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
