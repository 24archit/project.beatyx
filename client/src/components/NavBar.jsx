import React, { useEffect, useState } from "react";
import axios from "axios";
import "../assets/styles/NavBar.css";
import Logo from "./Logo";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import { LoginBtn, SignUpBtn } from "@/features/auth";
import { SpotifyConnectBtn } from "./SpotifyConnectBtn";
import { useSharedPlayer } from "@/features/player";
import Side from "./Side";

export default function NavBar() {
  const { isAuth, isSpotifyConnected } = useSharedPlayer();
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!isAuth) return;
      try {
        const token = window.localStorage.getItem("authToken");
        if (!token) return;
        const res = await axios.get(`${import.meta.env.VITE_SERVER_LINK}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile(res.data.user);
      } catch (e) {
        console.error("Failed to fetch profile in NavBar", e);
      }
    };

    fetchProfile();

    window.addEventListener("profileUpdated", fetchProfile);
    return () => window.removeEventListener("profileUpdated", fetchProfile);
  }, [isAuth]);

  const renderAvatar = () => {
    if (userProfile?.profilePic) {
      return (
        <img
          src={userProfile.profilePic}
          alt="Profile"
          style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }}
        />
      );
    }
    if (userProfile?.displayName) {
      return (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "14px",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          {userProfile.displayName.charAt(0)}
        </div>
      );
    }
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
      </svg>
    );
  };

  return (
    <>
      <nav className="nav-bar">
        {/* Left area — Hamburger & Logo */}
        <div className="nav-logo-area">
          <Side isAuth={isAuth} isSpotifyConnected={isSpotifyConnected} />
          <Logo />
        </div>

        {/* Search — grows in the middle */}
        <div className="nav-search-area">
          <SearchBar />
        </div>

        {/* Right area — auth on desktop, hamburger on mobile */}
        <div className="nav-right">
          {/* Desktop auth section */}
          {!isAuth ? (
            <div className="auth-buttons">
              <LoginBtn />
              <SignUpBtn />
              <SpotifyConnectBtn />
            </div>
          ) : !isSpotifyConnected ? (
            <div className="auth-buttons" style={{ gap: "1rem" }}>
              <SpotifyConnectBtn />
              <Link to="/profile" className="nav-avatar-btn desktop-only">
                {renderAvatar()}
              </Link>
            </div>
          ) : (
            <div className="auth-status" style={{ gap: "1rem" }}>
              <div className="spotify-connected-badge">
                <svg className="spotify-badge-icon" viewBox="0 0 24 24">
                  <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                </svg>
                <span>Spotify Connected</span>
              </div>
              <Link to="/profile" className="nav-avatar-btn desktop-only">
                {renderAvatar()}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
