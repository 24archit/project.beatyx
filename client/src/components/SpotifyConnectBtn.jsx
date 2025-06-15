import React from "react";
import "../assets/styles/SpotifyConnectBtn.css";
import { verifyAuth } from "../apis/apiFunctions.js";
export function SpotifyConnectBtn() {
  const handleClickOpen = async () => {
    try {
      const authToken = localStorage.getItem("authToken");

      if (!authToken) {
        alert("🔐 Please log in or sign up to connect your Spotify account.");
        return;
      }

      const response = await verifyAuth(authToken);

      if (response.isVerified) {
        
        const form = document.createElement("form");
        form.method = "POST";
        form.action = `${import.meta.env.VITE_SERVER_LINK}/auth/api/connectSpotify`;
        form.target = "_self";
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = "authToken";
        input.value = authToken;
        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();

      } else {
        alert(
          "🎵 You're just one step away! Log in or sign up to connect your Spotify and start the vibe."
        );
      }
    } catch (error) {
      console.error("Error while verifying auth or connecting Spotify:", error);
      alert(
        "⚠️ Something went wrong. Please try again later or check your network connection."
      );
      window.open(`${import.meta.env.VITE_CLIENT_LINK}`);
    }
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
