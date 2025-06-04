import React from "react";
import "../assets/styles/SpotifyConnectBtn.css";
export function SpotifyConnectBtn() {
  const handleClickOpen = () => {
    console.log("Button Clicked");
  };
  return (
    <div className="spotify-connect-btn-container">
      <button
        id="logout-btn"
        className="log-in-out-btns"
        onClick={handleClickOpen}
      >
        <i className="fa-solid fa-link" style={{marginRight: "5px"}}></i>
            Connect With Spotify
      </button>
    </div>
  );
}
