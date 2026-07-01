// client/src/components/SectionCard.jsx
import { useState } from "react";
import "../assets/styles/Card.css";
import TrackLogo from "/Track-Logo.webp";
import { Skeleton, Menu, MenuItem, IconButton } from "@mui/material";
import { format } from "indian-number-format";
import spotifyLogo from "/Spotify_logo.webp";
import { CardBtn } from "./CardBtn";
import { useSharedPlayer } from "@/features/player";
import { addLikedSong, removeLikedSong } from "@/services/userService";
import { Link } from "react-router-dom"; // Changed to Link for specific element wrapping

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
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const { likedSongs, toggleLikeLocal, trackInfo, playing } = useSharedPlayer();

  const isTrackCard = cardType === "track";
  const isLiked = isTrackCard && likedSongs.includes(cardId);
  const isPlayingThis = isTrackCard && trackInfo?.id === cardId && playing;

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
          <img
            className="card-photo"
            src={imgSrc}
            alt={cardName}
            loading="lazy"
            draggable="true"
            style={cardType === "artist" ? { borderRadius: "50%" } : {}}
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
          <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" title="Open in Spotify" className="card-overlay-spotify">
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
          <div className="card-overlay-like" onClick={handleLikeClick} title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"}>
            <i className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"} style={{ color: isLiked ? "#1db954" : "#fff", fontSize: "1.1rem" }}></i>
          </div>
        )}
      </div>

      {/* 2. Text Content */}
      <div className="card-text-content">
        <div className="card-title-row">
          <Link to={navPath} className="card-title-link">
            <p className="card-name" style={isPlayingThis ? { color: "#1db954" } : {}} title={cardName}>
              {cardName}
            </p>
          </Link>
        </div>

        <div className="card-subtitle-row">
          {cardType !== "playlist" && (
            <p className="card-subtitle" title={cardStat}>
              {albumType && <span className="tag">{albumType === "album" ? "Album • " : "Single • "}</span>}
              {cardStat}
            </p>
          )}

          {/* Kebab Menu */}
          <div className="card-menu-wrapper">
            <IconButton onClick={handleMenuClick} aria-label="more options" title="More options" size="small" sx={{ color: "var(--text-secondary)", padding: "2px" }}>
              <i className="fa-solid fa-ellipsis-v" style={{ fontSize: "1rem" }}></i>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{ sx: { bgcolor: "var(--bg-surface-2)", color: "#fff" } }}
            >
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: "0.85rem" }}>Edit</MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: "0.85rem" }}>Delete</MenuItem>
              <MenuItem onClick={handleMenuClose} sx={{ fontSize: "0.85rem" }}>Share</MenuItem>
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
      <Skeleton
        variant="rectangular"
        width={200}
        height={200}
        sx={{
          marginLeft: "1rem",
          marginRight: "1rem",
          bgcolor: "rgba(71, 164, 211, 0.261)",
          borderRadius: "1rem",
        }}
        animation="wave"
      />
      <Skeleton
        variant="rectangular"
        width={200}
        height={20}
        sx={{
          marginLeft: "1rem",
          marginRight: "1rem",
          marginTop: "0.7rem",
          bgcolor: "rgba(71, 164, 211, 0.261)",
          borderRadius: "1rem",
        }}
        animation="wave"
      />
      <Skeleton
        variant="rectangular"
        width={150}
        height={10}
        sx={{
          marginLeft: "1rem",
          marginRight: "1rem",
          marginTop: "0.7rem",
          bgcolor: "rgba(71, 164, 211, 0.261)",
          borderRadius: "1rem",
          alignSelf: "flex-start",
        }}
      />
    </div>
  );
}
