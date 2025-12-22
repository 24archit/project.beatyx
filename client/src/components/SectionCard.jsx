// client/src/components/SectionCard.jsx
import React, { useState } from "react";
import "../assets/styles/Card.css";
import TrackLogo from "/Track-Logo.webp";
import { Skeleton, Menu, MenuItem, IconButton } from "@mui/material";
import { format } from "indian-number-format";
import spotifyLogo from "/Spotify_logo.webp";
import { CardBtn } from "./CardBtn";
import { useSharedPlayer } from "../context/PlayerContext"; 
import { addLikedSong, removeLikedSong } from "../apis/apiFunctions";
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
      case "album": return `/album/${cardId}`;
      case "playlist": return `/playlist/${cardId}`;
      case "track": return `/track/${cardId}`;
      case "artist": return `/artist/${cardId}`;
      default: return "#";
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
      {/* Removed onClick from main card div */}
      <div className="card">
        {/* Card Header */}
        <div className="card-header">
          <div className="card-menu">
            <IconButton onClick={handleMenuClick} aria-label="more options" title="More options">
              <i className="fa-solid fa-ellipsis-v" id="kebab-menu-icon"></i>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
              <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
              <MenuItem onClick={handleMenuClose}>Share</MenuItem>
            </Menu>
          </div>
          <div className="spotify-logo">
            <a href={spotifyUrl} target="_blank" rel="noopener noreferrer" title="Open in Spotify">
              <img src={spotifyLogo} alt="Spotify" style={{ width: "22px", height: "22px" }} />
            </a>
          </div>
        </div>

        {/* Card Details */}
        <div className="card-details">
          <div
            className="card-img"
            style={cardType === "artist" ? { borderRadius: "50%" } : {}}
          >
            {/* 1. LINK ADDED TO IMAGE */}
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
          </div>

          <div className="card-name-container">
             {/* 2. LINK ADDED TO NAME */}
            <Link to={navPath} style={{ textDecoration: 'none', color: 'inherit' }}>
                <p className="card-name" style={isPlayingThis ? { color: "#1db954" } : {}} title={cardName}>
                {cardName}
                </p>
            </Link>
          </div>

          {albumType && (
            <span className="card-stat-3"><p>{albumType === "album" ? "Album" : "Single"}</p></span>
          )}
          {followers && (
            <span className="card-stat-3"><p>{`${format(followers)} Followers`}</p></span>
          )}

          <div className="card-stat-row">
            <div className="card-stat-container">
               <p className="card-stat" title={cardStat}>{cardStat}</p>
            </div>
            
            {isTrackCard && (
               <div 
                  className="like-icon-section" 
                  onClick={handleLikeClick} 
                  title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"} 
               >
                  <i 
                     className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
                     style={{ 
                       color: isLiked ? "#fb064fff" : "#b3b3b3", 
                       fontSize: "1.1rem" 
                     }}
                  ></i>
               </div>
            )}
          </div>
        </div>
      </div>
      
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
  );
}

// SectionCardLoad remains unchanged...
export function SectionCardLoad() {
    return (
    <div className="card-container">
      <Skeleton variant="rectangular" width={200} height={200} sx={{ marginLeft: "1rem", marginRight: "1rem", bgcolor: "rgba(71, 164, 211, 0.261)", borderRadius: "1rem" }} animation="wave" />
      <Skeleton variant="rectangular" width={200} height={20} sx={{ marginLeft: "1rem", marginRight: "1rem", marginTop: "0.7rem", bgcolor: "rgba(71, 164, 211, 0.261)", borderRadius: "1rem" }} animation="wave" />
      <Skeleton variant="rectangular" width={150} height={10} sx={{ marginLeft: "1rem", marginRight: "1rem", marginTop: "0.7rem", bgcolor: "rgba(71, 164, 211, 0.261)", borderRadius: "1rem", alignSelf: "flex-start" }} />
    </div>
  );
}