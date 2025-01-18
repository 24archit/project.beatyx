import React from "react";
import "../assets/styles/Card.css";
import TrackLogo from "../assets/media/Track-Logo.webp";
import { Skeleton } from "@mui/material";
import { format } from "indian-number-format";

import { useState } from "react";
import { Snackbar, Alert, AlertTitle } from "@mui/material";
import spotifyLogo from "../assets/media/Spotify_logo.webp";
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
  spotifyUrl = "",
}) {
  const [alertVisibility, setAlertVisibility] = useState(false);
  

  return (
    <>
      <div className="card-container">
        <div className="card">
          <div className="card-details">
            <div className="spotify-logo">
              <a
                href={spotifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={"Explore the content on Spotify"}
                title={"Explore the content on Spotify"}
              >
                <img src={spotifyLogo} alt="Spotify Logo" />
              </a>
            </div>
            <div className="card-img">
              <img
                className="card-photo"
                src={imgSrc}
                alt="img1"
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

          {/* <button
          className="play-btn india-track-play-btn"
          onClick={handelOnClick}
          name={iconId === "link-btn" ? "Go To Page" : "Play Track"}
        >
          <i className={iconClass} id={iconId}></i>
        </button> */}
          {/* {alertVisibility && (
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }} // Adjusted anchorOrigin to top center
          autoHideDuration={6000}
          open={alertVisibility}
          onClose={() => setAlertVisibility(false)}
          //disableBackdropClick={true}
        >
          <Alert variant="filled" severity="error">
            <AlertTitle>Track Unavailable</AlertTitle>
            Sorry, this track is currently unavailable.
          </Alert>
        </Snackbar>
      )} */}
        </div>
        <CardBtn
          iconId={iconId}
          logoClass={iconClass}
          logoId={iconId}
          cardId={cardId}
          cardType={cardType}
          setPlayerMeta={setPlayerMeta}
        />
      </div>
    </>
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
