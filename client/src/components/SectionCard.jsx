import React, { useState } from "react";
import "../assets/styles/Card.css";
import TrackLogo from "/Track-Logo.webp";
import { Skeleton, Menu, MenuItem, IconButton } from "@mui/material";
import { format } from "indian-number-format";
import spotifyLogo from "/Spotify_logo.webp";
import { CardBtn } from "./CardBtn";

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

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  return (
    <div className="card-container">
      <div className="card">
        {/* Kebab Menu */}
        <div className="card-header">
          <div className="card-menu">
            <IconButton onClick={handleMenuClick} aria-label="more options">
              <i className="fa-solid fa-ellipsis-v" id="kebab-menu-icon"></i>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
            >
              <MenuItem onClick={handleMenuClose}>Edit</MenuItem>
              <MenuItem onClick={handleMenuClose}>Delete</MenuItem>
              <MenuItem onClick={handleMenuClose}>Share</MenuItem>
            </Menu>
          </div>
          <div className="spotify-logo">
            <a
              href={spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore the content on Spotify"
              title="Explore the content on Spotify"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 168 168"
                xmlns="http://www.w3.org/2000/svg"
                role="img"
                aria-label="Spotify Logo"
              >
                <title>Explore Content On Spotify</title>
                <path
                  fill="#ffffff"
                  d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.2 121.2c-1.4 2.3-4.4 3-6.7 1.6-18.4-11.3-41.5-13.9-68.8-7.8-2.6.6-5.2-1-5.8-3.6-.6-2.6 1-5.2 3.6-5.8 30.5-6.8 57.3-3.7 78 9 2.2 1.4 2.9 4.4 1.7 6.6zm9.5-19.5c-1.8 2.9-5.5 3.8-8.3 2-21.1-13-53.3-16.8-78.1-9.5-3.2.9-6.5-.9-7.5-4.1-.9-3.2.9-6.5 4.1-7.5 29.7-8.5 66.4-4.2 91.6 11.1 2.8 1.8 3.6 5.5 2 8zm.9-20.6c-25.2-15.2-66.5-16.6-90.5-9.4-3.8 1.1-7.8-1-8.9-4.8-1.1-3.8 1-7.8 4.8-8.9 28.6-8.5 75.5-6.8 104.2 10.8 3.4 2 4.5 6.4 2.4 9.8-2.1 3.4-6.5 4.5-9.9 2.5z"
                />
              </svg>
            </a>
          </div>
        </div>
        {/* End Kebab Menu */}

        <div className="card-details">
          <div
            className="card-img"
            style={cardType === "artist" ? { borderRadius: "50%" } : {}}
          >
            <img
              className="card-photo"
              src={imgSrc}
              alt="img1"
              loading="lazy"
              draggable="true"
              style={cardType === "artist" ? { borderRadius: "50%" } : {}}
            />
          </div>
          <div className="card-name-container">
            <p className="card-name">{cardName}</p>
          </div>
          {albumType && (
            <span className="card-stat-3">
              <p>{albumType === "album" ? "Album" : "Single"}</p>
            </span>
          )}
          {followers && (
            <span className="card-stat-3">
              <p>{`${format(followers)} Followers`}</p>
            </span>
          )}
          <div className="card-stat-container">
            <p className="card-stat">{cardStat}</p>
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
      <Skeleton
        variant="rectangular"
        width={100}
        height={10}
        sx={{
          marginLeft: "1rem",
          marginRight: "1rem",
          marginTop: "0.7rem",
          bgcolor: "rgba(71, 164, 211, 0.261)",
          borderRadius: "1rem",
          alignSelf: "flex-start",
          marginBottom: "1rem",
        }}
      />
    </div>
  );
}
