const router = require("express").Router();
const CustomPlaylist = require("../models/customPlaylist");
const User = require("../models/user");
const setToken = require("../middlewares/setToken");
const crypto = require("crypto");

// Middleware to verify user is logged in
const requireAuth = async (req, res, next) => {
  if (!req.user || !req.user.user || !req.user.user.email) {
    return res.status(401).json({ message: "Unauthorized. Please sign in." });
  }

  try {
    const user = await User.findOne({ email: req.user.user.email });
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Attach the user's ObjectId to req so routes can use it
    req.userId = user._id;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(500).json({ message: "Server error during authentication" });
  }
};

// Middleware to optionally attach userId if logged in (for public routes)
const optionalAuth = async (req, res, next) => {
  if (req.user && req.user.user && req.user.user.email) {
    try {
      const user = await User.findOne({ email: req.user.user.email });
      if (user) {
        req.userId = user._id;
      }
    } catch (error) {
      console.error("Optional auth error:", error);
    }
  }
  next();
};

/**
 * Helper to generate unique btx_ playlist IDs
 */
const generateBtxId = () => {
  return "btx_" + crypto.randomBytes(12).toString("hex");
};

/**
 * Create a new custom playlist
 * @route POST /api/custom-playlists
 */
router.post("/api/custom-playlists", setToken, requireAuth, async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Playlist name is required" });
    }

    const newPlaylist = new CustomPlaylist({
      _id: generateBtxId(),
      name: name.trim(),
      description: description ? description.trim() : "",
      ownerId: req.userId,
      isPublic: isPublic || false,
      tracks: [],
    });

    await newPlaylist.save();
    res.status(201).json({ playlist: newPlaylist });
  } catch (error) {
    console.error("Error creating playlist:", error);
    res.status(500).json({ message: "Failed to create playlist" });
  }
});

/**
 * Get all playlists created by the logged in user (My Playlists)
 * @route GET /api/custom-playlists/me
 */
router.get("/api/custom-playlists/me", setToken, requireAuth, async (req, res) => {
  try {
    const playlists = await CustomPlaylist.find({ ownerId: req.userId }).sort({ updatedAt: -1 });
    res.json({ playlists });
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    res.status(500).json({ message: "Failed to fetch playlists" });
  }
});

/**
 * Get all public playlists for Beatyx Discovery (Search)
 * @route GET /api/custom-playlists/search
 */
router.get("/api/custom-playlists/search", setToken, optionalAuth, async (req, res) => {
  try {
    const { q } = req.query;
    let query = {};
    if (req.userId) {
      query.$or = [{ isPublic: true }, { ownerId: req.userId }];
    } else {
      query.isPublic = true;
    }

    if (q) {
      query.name = { $regex: q, $options: "i" }; // Case-insensitive search on name
    }

    const playlists = await CustomPlaylist.find(query)
      .populate("ownerId", "displayName profilePic")
      .sort({ updatedAt: -1 })
      .limit(20);

    // Add isOwner flag
    const playlistsWithOwnerFlag = playlists.map((pl) => {
      const plObj = pl.toObject();
      plObj.isOwner =
        req.userId && pl.ownerId && req.userId.toString() === pl.ownerId._id.toString();
      return plObj;
    });

    res.json({ playlists: playlistsWithOwnerFlag });
  } catch (error) {
    console.error("Error searching playlists:", error);
    res.status(500).json({ message: "Failed to search playlists" });
  }
});

/**
 * Get a specific custom playlist by ID
 * @route GET /api/custom-playlists/:id
 */
router.get("/api/custom-playlists/:id", setToken, optionalAuth, async (req, res) => {
  try {
    const playlistId = req.params.id;
    const playlist = await CustomPlaylist.findById(playlistId).populate(
      "ownerId",
      "displayName profilePic"
    );

    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    // Privacy check
    if (!playlist.isPublic) {
      // If private, only owner can view
      if (!req.userId || req.userId.toString() !== playlist.ownerId._id.toString()) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.json({ playlist });
  } catch (error) {
    console.error("Error fetching playlist:", error);
    res.status(500).json({ message: "Failed to fetch playlist" });
  }
});

/**
 * Update a custom playlist (Name, Description, Privacy)
 * @route PUT /api/custom-playlists/:id
 */
router.put("/api/custom-playlists/:id", setToken, requireAuth, async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { name, description, isPublic } = req.body;

    const playlist = await CustomPlaylist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.ownerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this playlist" });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();
      if (trimmedName.length === 0) {
        return res.status(400).json({ message: "Playlist name cannot be empty" });
      }
      if (trimmedName.length > 100) {
        return res.status(400).json({ message: "Playlist name too long (max 100 chars)" });
      }
      playlist.name = trimmedName;
    }
    if (description !== undefined) playlist.description = description.trim();
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save(); // pre-save hook will update snapshotId
    res.json({ playlist });
  } catch (error) {
    console.error("Error updating playlist:", error);
    res.status(500).json({ message: "Failed to update playlist" });
  }
});

/**
 * Delete a custom playlist
 * @route DELETE /api/custom-playlists/:id
 */
router.delete("/api/custom-playlists/:id", setToken, requireAuth, async (req, res) => {
  try {
    const playlistId = req.params.id;

    const playlist = await CustomPlaylist.findById(playlistId);
    if (!playlist) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    if (playlist.ownerId.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this playlist" });
    }

    await CustomPlaylist.deleteOne({ _id: playlistId });

    // Also remove this playlist from anyone's savedPlaylists
    await User.updateMany(
      { savedPlaylists: playlistId },
      { $pull: { savedPlaylists: playlistId } }
    );

    res.json({ message: "Playlist deleted successfully" });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    res.status(500).json({ message: "Failed to delete playlist" });
  }
});

/**
 * Add a track to a custom playlist
 * @route POST /api/custom-playlists/:id/tracks
 */
router.post("/api/custom-playlists/:id/tracks", setToken, requireAuth, async (req, res) => {
  try {
    const playlistId = req.params.id;
    const { id, trackName, artistNames, imgSrc, duration, spotifyUrl } = req.body;

    if (!id || !trackName) {
      return res.status(400).json({ message: "Track ID and Name are required" });
    }

    // Store artist objects { name, id, spotifyUrl }
    let formattedArtists = [];
    if (Array.isArray(artistNames)) {
      formattedArtists = artistNames.map((artist) => {
        if (typeof artist === "string") return { name: artist, id: "", spotifyUrl: "" };
        if (artist && typeof artist === "object") {
          return {
            name: artist.name || "",
            id: artist.id || "",
            spotifyUrl: artist.external_urls?.spotify || "",
          };
        }
        return { name: String(artist), id: "", spotifyUrl: "" };
      });
    }

    const newTrack = {
      id,
      trackName,
      artists: formattedArtists,
      imgSrc,
      duration,
      spotifyUrl,
    };

    const newSnapshotId =
      "snapshot_" + Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Atomically find by ID & Owner, check that track.id is not already present, push the track, and set snapshotId.
    const playlist = await CustomPlaylist.findOneAndUpdate(
      {
        _id: playlistId,
        ownerId: req.userId,
        "tracks.id": { $ne: id }, // Prevent duplicate tracks atomically
      },
      {
        $push: { tracks: newTrack },
        $set: { snapshotId: newSnapshotId },
      },
      { new: true, runValidators: true }
    );

    if (!playlist) {
      // It might not exist, might not be owned by user, or might already contain the track.
      // We do a fallback check to provide a precise error message.
      const existingPlaylist = await CustomPlaylist.findById(playlistId);
      if (!existingPlaylist) {
        return res.status(404).json({ message: "Playlist not found" });
      }
      if (existingPlaylist.ownerId.toString() !== req.userId.toString()) {
        return res.status(403).json({ message: "Not authorized to modify this playlist" });
      }
      return res.status(400).json({ message: "Track already in playlist" });
    }

    res.json({ playlist });
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    res.status(500).json({ message: "Failed to add track" });
  }
});

/**
 * Remove a track from a custom playlist
 * @route DELETE /api/custom-playlists/:id/tracks/:trackId
 */
router.delete(
  "/api/custom-playlists/:id/tracks/:trackId",
  setToken,
  requireAuth,
  async (req, res) => {
    try {
      const playlistId = req.params.id;
      const trackId = req.params.trackId; // The Spotify track ID

      const newSnapshotId =
        "snapshot_" + Date.now().toString(36) + Math.random().toString(36).substr(2);

      // Atomically find by ID & Owner, pull the track, and update snapshotId
      const playlist = await CustomPlaylist.findOneAndUpdate(
        {
          _id: playlistId,
          ownerId: req.userId,
        },
        {
          $pull: { tracks: { id: trackId } },
          $set: { snapshotId: newSnapshotId },
        },
        { new: true } // Returns the modified document
      );

      if (!playlist) {
        // Either doesn't exist or not owner
        const existingPlaylist = await CustomPlaylist.findById(playlistId);
        if (!existingPlaylist) return res.status(404).json({ message: "Playlist not found" });
        return res.status(403).json({ message: "Not authorized to modify this playlist" });
      }

      res.json({ playlist });
    } catch (error) {
      console.error("Error removing track from playlist:", error);
      res.status(500).json({ message: "Failed to remove track" });
    }
  }
);

/**
 * Save/Follow a public playlist (or Spotify playlist)
 * @route POST /api/custom-playlists/save/:id
 */
router.post("/api/custom-playlists/save/:id", setToken, requireAuth, async (req, res) => {
  try {
    const playlistId = req.params.id;

    if (playlistId.startsWith("btx_")) {
      // Use findOne for atomic check-and-update preconditions
      const playlist = await CustomPlaylist.findOne({
        _id: playlistId,
        $or: [{ isPublic: true }, { ownerId: req.userId }],
      });
      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found or not accessible" });
      }
    }

    // $addToSet is atomic — handles concurrent duplicates correctly
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $addToSet: { savedPlaylists: playlistId } },
      { new: true, select: "savedPlaylists" }
    );

    res.json({ savedPlaylists: updatedUser.savedPlaylists });
  } catch (error) {
    console.error("Error saving playlist:", error);
    res.status(500).json({ message: "Failed to save playlist" });
  }
});

/**
 * Unsave/Unfollow a playlist
 * @route DELETE /api/custom-playlists/save/:id
 */
router.delete("/api/custom-playlists/save/:id", setToken, requireAuth, async (req, res) => {
  try {
    const playlistId = req.params.id;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { $pull: { savedPlaylists: playlistId } },
      { new: true, select: "savedPlaylists" }
    );

    res.json({ savedPlaylists: user.savedPlaylists });
  } catch (error) {
    console.error("Error unsaving playlist:", error);
    res.status(500).json({ message: "Failed to unsave playlist" });
  }
});

/**
 * Get user's saved playlists (populated for btx_, raw IDs for spotify)
 * @route GET /api/custom-playlists/saved/me
 */
router.get("/api/custom-playlists/saved/me", setToken, requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    const btxIds = user.savedPlaylists.filter((id) => id.startsWith("btx_"));
    const spotifyIds = user.savedPlaylists.filter((id) => !id.startsWith("btx_"));

    // Populate the custom playlists
    const customSavedPlaylists = await CustomPlaylist.find({ _id: { $in: btxIds } }).populate(
      "ownerId",
      "displayName profilePic"
    );

    // For Spotify IDs, the frontend will need to fetch them from Spotify API individually,
    // so we just return the raw IDs for them.

    res.json({
      customSavedPlaylists,
      spotifySavedPlaylistIds: spotifyIds,
    });
  } catch (error) {
    console.error("Error fetching saved playlists:", error);
    res.status(500).json({ message: "Failed to fetch saved playlists" });
  }
});

module.exports = router;
