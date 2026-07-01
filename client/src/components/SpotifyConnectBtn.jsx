import "../assets/styles/SpotifyConnectBtn.css";
import { verifyAuth } from "@/features/auth/authService";
import { useEffect } from "react";

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
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import("@capacitor/browser");
          const url = `${import.meta.env.VITE_SERVER_LINK}/auth/api/connectSpotify?authToken=${authToken}&appRedirect=beatyx://callback`;
          await Browser.open({ url });
        } else {
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
        }
      } else {
        alert(
          "🎵 You're just one step away! Log in or sign up to connect your Spotify and start the vibe."
        );
      }
    } catch (error) {
      console.error("Error while verifying auth or connecting Spotify:", error);
      alert("⚠️ Something went wrong. Please try again later or check your network connection.");
      window.open("/");
    }
  };

  // Listen for custom event from hamburger drawer
  useEffect(() => {
    document.addEventListener("connectSpotify", handleClickOpen);
    return () => document.removeEventListener("connectSpotify", handleClickOpen);
  }, []);
  return (
    <div className="spotify-connect-btn-container">
      <button className="spotify-trigger-btn" onClick={handleClickOpen}>
        <i className="fa-solid fa-link" style={{ marginRight: "0.2rem" }}></i>
        Connect With Spotify
      </button>
    </div>
  );
}
