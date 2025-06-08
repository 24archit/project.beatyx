import React from "react";
import "../assets/styles/SpotifyConnectBtn.css";
import { connectSpotify } from "../apis/apiFunctions.js";
export function SpotifyConnectBtn() {
  const handleClickOpen = () => {
    window.open(
      `${import.meta.env.VITE_SERVER_LINK}/auth/api/connectSpotify`,
      "_self"
    );
  };
  return (
    <div className="spotify-connect-btn-container">
      <button
        id="logout-btn"
        className="log-in-out-btns"
        onClick={handleClickOpen}
      >
        <i className="fa-solid fa-link" style={{ marginRight: "5px" }}></i>
        Connect With Spotify
      </button>
    </div>
  );
}
