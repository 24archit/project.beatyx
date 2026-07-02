// client/src/components/SectionCard.jsx
import { useState } from "react";
import "../assets/styles/Card.css";
import TrackLogo from "/Track-Logo.webp";
import { Skeleton, Menu, MenuItem, IconButton } from "@mui/material";
import { format } from "indian-number-format";
import spotifyLogo from "/Spotify_logo.webp";
import { CardBtn } from "./CardBtn";
import { useSharedPlayer } from "@/features/player";
import {
  addLikedSong,
  removeLikedSong,
  getUserProfile,
  addSavedAlbum,
  removeSavedAlbum,
} from "@/services/userService";
import { Link } from "react-router-dom";
import { LazyImage } from "./LazyImage.jsx";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import {
  saveCustomPlaylist,
  unsaveCustomPlaylist,
  getMySavedPlaylists,
} from "@/services/customPlaylistService";
import { shareContent } from "@/utils/shareUtil";

export function SectionCard({
  imgSrc = TrackLogo,
  cardName = "Loading..",
  cardStat = "Please Wait..",
  iconClass = "fa-solid fa-link",
  iconId = "link-btn",
  albumType = "",
  followers = "",
  cardType = "",
  cardId = "",
  setPlayerMeta,
  setTrackInfo,
  spotifyUrl = "",
  artistNames = [],
  isOwner = false,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { likedSongs, toggleLikeLocal, trackInfo, playing } = useSharedPlayer();
  const queryClient = useQueryClient();

  const isTrackCard = cardType === "track";
  const isLiked = isTrackCard && likedSongs.includes(cardId);
  const isPlayingThis = isTrackCard && trackInfo?.id === cardId && playing;

  const savePlaylistMutation = useMutation({
    mutationFn: (id) => saveCustomPlaylist(id),
    onSuccess: () => {
      alert("Playlist saved to your library!");
      queryClient.invalidateQueries(["savedPlaylists"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to save playlist");
    },
  });

  const unsavePlaylistMutation = useMutation({
    mutationFn: (id) => unsaveCustomPlaylist(id),
    onSuccess: () => {
      alert("Playlist removed from your library!");
      queryClient.invalidateQueries(["savedPlaylists"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to remove playlist");
    },
  });

  const authToken = window.localStorage.getItem("authToken");

  const { data: savedData } = useQuery({
    queryKey: ["savedPlaylists"],
    queryFn: getMySavedPlaylists,
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
  });

  const { data: userProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
  });

  const saveAlbumMutation = useMutation({
    mutationFn: (id) => addSavedAlbum(id),
    onSuccess: () => {
      alert("Album saved to your library!");
      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to save album");
    },
  });

  const unsaveAlbumMutation = useMutation({
    mutationFn: (id) => removeSavedAlbum(id),
    onSuccess: () => {
      alert("Album removed from your library!");
      queryClient.invalidateQueries(["userProfile"]);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Failed to remove album");
    },
  });

  const isCustomPlaylist = cardType === "playlist" && String(cardId).startsWith("btx_");
  const isSpotifyPlaylist = cardType === "playlist" && !isCustomPlaylist;
  const isSavedPlaylist =
    (isCustomPlaylist && savedData?.customSavedPlaylists?.some((pl) => pl._id === cardId)) ||
    (isSpotifyPlaylist && savedData?.spotifySavedPlaylistIds?.includes(cardId));

  const isSavedAlbum = cardType === "album" && userProfile?.user?.savedAlbums?.includes(cardId);
  const isSaved = isSavedPlaylist || isSavedAlbum;

  // Helper to determine the link path
  const getNavPath = () => {
    switch (cardType) {
      case "album":
        return `/album/${cardId}`;
      case "playlist":
        return `/playlist/${cardId}`;
      case "track":
        return `/track/${cardId}`;
      case "artist":
        return `/artist/${cardId}`;
      default:
        return "#";
    }
  };

  const navPath = getNavPath();

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const token = window.localStorage.getItem("authToken");

    if (!token) {
      alert("Login Required\n\nYou must be logged in to save songs to your library.");
      return;
    }

    toggleLikeLocal(cardId);
    try {
      if (isLiked) await removeLikedSong(cardId);
      else await addLikedSong(cardId);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["likedSongsPage"] });
    } catch (error) {
      console.error("Like failed", error);
      toggleLikeLocal(cardId);
    }
  };

  return (
    <div className="card-container">
      {/* 1. Image Wrapper (Aspect Ratio 1:1) */}
      <div className="card-img-wrapper">
        <Link to={navPath}>
          <LazyImage
            className="card-photo"
            src={imgSrc}
            alt={cardName}
            style={
              cardType === "artist"
                ? { borderRadius: "50%", width: "100%", height: "100%" }
                : { width: "100%", height: "100%" }
            }
          />
        </Link>

        {/* Wave Overlay if Playing */}
        {isPlayingThis && (
          <div className="card-wave-overlay" title="Now Playing">
            <div className="card-music-wave">
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
              <div className="bar"></div>
            </div>
          </div>
        )}

        {/* Spotify Logo Overlay */}
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open in Spotify"
            className="card-overlay-spotify"
          >
            <img src={spotifyLogo} alt="Spotify" />
          </a>
        )}

        {/* Play Button Overlay (FAB style) */}
        <div className="card-overlay-play">
          <CardBtn
            iconId={iconId}
            logoClass={iconClass}
            logoId={iconId}
            cardId={cardId}
            cardType={cardType}
            setPlayerMeta={setPlayerMeta}
            setTrackInfo={setTrackInfo}
            cardName={cardName}
            imgSrc={imgSrc}
            artistNames={artistNames}
          />
        </div>

        {/* Like Button Overlay (Top Right) */}
        {isTrackCard && (
          <div
            className="card-overlay-like"
            onClick={handleLikeClick}
            title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}
          >
            <i
              className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
              style={{ color: isLiked ? "#1db954" : "#fff", fontSize: "1.1rem" }}
            ></i>
          </div>
        )}

        {/* Saved Indicator (Badge) */}
        {(cardType === "playlist" || cardType === "album") && isSaved && (
          <div className="card-overlay-saved" title="Saved to Library">
            <i className="fa-solid fa-bookmark"></i>
            <span>Saved</span>
          </div>
        )}
      </div>

      {/* 2. Text Content */}
      <div className="card-text-content">
        <div className="card-title-row">
          <Link to={navPath} className="card-title-link">
            <p
              className="card-name"
              style={isPlayingThis ? { color: "#1db954" } : {}}
              title={cardName}
            >
              {cardName}
            </p>
          </Link>
        </div>

        <div className="card-subtitle-row">
          {cardType !== "playlist" && (
            <p className="card-subtitle" title={cardStat}>
              {albumType && (
                <span className="tag">{albumType === "album" ? "Album • " : "Single • "}</span>
              )}
              {cardStat}
            </p>
          )}

          {/* Kebab Menu */}
          <div className="card-menu-wrapper">
            <IconButton
              onClick={handleMenuClick}
              aria-label="more options"
              title="More options"
              size="small"
              sx={{
                color: "var(--text-secondary)",
                padding: "4px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                "&:hover": {
                  color: "#fff",
                  background: "rgba(168, 85, 247, 0.12)",
                },
              }}
            >
              <i className="fa-solid fa-ellipsis-v" style={{ fontSize: "0.95rem" }}></i>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              transitionDuration={180}
              PaperProps={{
                sx: {
                  bgcolor: "rgba(14, 8, 28, 0.97)",
                  backdropFilter: "blur(24px)",
                  WebkitBackdropFilter: "blur(24px)",
                  border: "1px solid rgba(168, 85, 247, 0.18)",
                  borderRadius: "14px",
                  boxShadow: "0 16px 48px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)",
                  color: "#fff",
                  minWidth: "190px",
                  overflow: "hidden",
                  padding: "6px",
                  "& .MuiMenuItem-root": {
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    borderRadius: "9px",
                    padding: "9px 14px",
                    gap: "10px",
                    color: "rgba(255,255,255,0.82)",
                    transition: "all 0.15s ease",
                    letterSpacing: "0.01em",
                    "&:hover": {
                      bgcolor: "rgba(168, 85, 247, 0.15)",
                      color: "#fff",
                    },
                  },
                  "& .MuiDivider-root": {
                    borderColor: "rgba(255,255,255,0.07)",
                    margin: "4px 0",
                  },
                },
              }}
            >
              {isTrackCard && (
                <MenuItem
                  onClick={(e) => {
                    handleMenuClose();
                    e.stopPropagation();
                    document.dispatchEvent(
                      new CustomEvent("openPlaylistDialog", {
                        detail: {
                          trackData: {
                            id: cardId,
                            trackName: cardName,
                            artistNames:
                              typeof artistNames === "string"
                                ? artistNames.split(", ")
                                : artistNames,
                            imgSrc,
                            duration: 0,
                            spotifyUrl,
                          },
                        },
                      })
                    );
                  }}
                >
                  <i
                    className="fa-solid fa-plus"
                    style={{ width: 16, color: "var(--accent-primary)", fontSize: "0.8rem" }}
                  ></i>
                  Add to Playlist
                </MenuItem>
              )}
              {((isCustomPlaylist && !isOwner) || isSpotifyPlaylist) && !isSavedPlaylist && (
                <MenuItem
                  onClick={(e) => {
                    handleMenuClose();
                    e.stopPropagation();
                    savePlaylistMutation.mutate(cardId);
                  }}
                >
                  <i
                    className="fa-solid fa-bookmark"
                    style={{ width: 16, color: "var(--accent-primary)", fontSize: "0.8rem" }}
                  ></i>
                  Save Playlist
                </MenuItem>
              )}
              {((isCustomPlaylist && !isOwner) || isSpotifyPlaylist) && isSavedPlaylist && (
                <MenuItem
                  onClick={(e) => {
                    handleMenuClose();
                    e.stopPropagation();
                    unsavePlaylistMutation.mutate(cardId);
                  }}
                  sx={{ color: "var(--accent-primary) !important" }}
                >
                  <i className="fa-solid fa-bookmark" style={{ width: 16, fontSize: "0.8rem" }}></i>
                  Remove from Saved
                </MenuItem>
              )}
              {cardType === "album" && !isSavedAlbum && (
                <MenuItem
                  onClick={(e) => {
                    handleMenuClose();
                    e.stopPropagation();
                    saveAlbumMutation.mutate(cardId);
                  }}
                >
                  <i
                    className="fa-solid fa-floppy-disk"
                    style={{ width: 16, color: "var(--accent-primary)", fontSize: "0.8rem" }}
                  ></i>
                  Save Album
                </MenuItem>
              )}
              {cardType === "album" && isSavedAlbum && (
                <MenuItem
                  onClick={(e) => {
                    handleMenuClose();
                    e.stopPropagation();
                    unsaveAlbumMutation.mutate(cardId);
                  }}
                  sx={{ color: "var(--accent-primary) !important" }}
                >
                  <i
                    className="fa-solid fa-floppy-disk"
                    style={{ width: 16, fontSize: "0.8rem" }}
                  ></i>
                  Remove from Saved
                </MenuItem>
              )}
              <MenuItem
                onClick={(e) => {
                  handleMenuClose();
                  e.stopPropagation();
                  shareContent(navPath, cardName);
                }}
              >
                <i
                  className="fa-solid fa-share"
                  style={{ width: 16, color: "var(--accent-primary)", fontSize: "0.8rem" }}
                ></i>
                Share
              </MenuItem>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
}

// SectionCardLoad remains unchanged...
export function SectionCardLoad() {
  return (
    <div className="card-container">
      <div className="card-img-wrapper">
        <Skeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            bgcolor: "rgba(71, 164, 211, 0.261)",
          }}
          animation="wave"
        />
      </div>
      <div className="card-text-content">
        <div className="card-title-row">
          <Skeleton
            variant="rectangular"
            width="80%"
            height={20}
            sx={{
              bgcolor: "rgba(71, 164, 211, 0.261)",
              borderRadius: "4px",
            }}
            animation="wave"
          />
        </div>
        <div className="card-subtitle-row">
          <Skeleton
            variant="rectangular"
            width="60%"
            height={12}
            sx={{
              bgcolor: "rgba(71, 164, 211, 0.261)",
              borderRadius: "4px",
              marginTop: "4px",
            }}
            animation="wave"
          />
        </div>
      </div>
    </div>
  );
}
