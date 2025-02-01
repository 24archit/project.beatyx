import React from "react";
import "../assets/styles/Card.css";
import TrackLogo from "../assets/media/Track-Logo.webp";
import { Skeleton } from "@mui/material";
import { format } from "indian-number-format";
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
                <img src={spotifyLogo} alt="Spotify Logo" loading="lazy"/>
              </a>
            </div>
            <div className="card-img" style={cardType === "artist" ? { borderRadius: "50%" } : {}}>
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
