import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSharedPlayer } from "@/features/player";
import Logo from "@/components/Logo";
import "../assets/styles/AccountSettingsPage.css";
import axios from "axios";

export default function AccountSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [spotifyDone, setSpotifyDone] = useState(false);
  const [userData, setUserData] = useState(null);
  const [displayName, setDisplayName] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const fileInputRef = useRef(null);

  const { setIsSpotifyConnected } = useSharedPlayer();

  const navigate = useNavigate();
  const authToken = window.localStorage.getItem("authToken");

  useEffect(() => {
    if (!authToken) {
      navigate("/");
    }
  }, [authToken, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_SERVER_LINK}/user/profile`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        setUserData(res.data.user);
        setDisplayName(res.data.user.displayName || "");
        setProfilePic(res.data.user.profilePic || "");
      } catch (error) {
        console.error(error);
      } finally {
        setIsFetchingProfile(false);
      }
    };
    fetchProfile();
  }, [authToken]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 256;
        const MAX_HEIGHT = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setProfilePic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!displayName.trim()) return;
    setLoading(true);
    setSaveStatus("");
    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_LINK}/user/profile-update`,
        { displayName, profilePic },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setSaveStatus("Profile updated successfully!");
      window.dispatchEvent(new Event("profileUpdated"));
      setTimeout(() => setSaveStatus(""), 3000);
    } catch (error) {
      console.error(error);
      setSaveStatus("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnectSpotify = async () => {
    const confirmed = window.confirm(
      "Disconnect your Spotify account from Beatyx? Your Beatyx data won't be affected."
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await axios.put(
        `${import.meta.env.VITE_SERVER_LINK}/user/disconnect-spotify`,
        {},
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setSpotifyDone(true);
      setIsSpotifyConnected(false); // Update global state so NavBar reflects immediately
    } catch (error) {
      console.error(error);
      alert("Failed to disconnect Spotify. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "⚠️ This is permanent. All your Beatyx data — liked songs, playlists, and your account — will be deleted forever. Continue?"
    );
    if (!confirmed) return;
    setLoading(true);
    try {
      await axios.delete(`${import.meta.env.VITE_SERVER_LINK}/user/account`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      window.localStorage.clear();
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Failed to delete account. Please try again.");
      setLoading(false);
    }
  };

  if (!authToken) return null;

  return (
    <div className="as-page">
      {/* ── Branding header ── */}
      <div className="as-brand">
        <Logo />
      </div>

      {/* ── Page title ── */}
      <div className="as-header">
        <button className="as-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div>
          <h1 className="as-title">Account Settings</h1>
          <p className="as-subtitle">Manage your Beatyx account and connected services</p>
        </div>
      </div>

      {/* ── Settings sections ── */}
      <div className="as-sections">
        {/* Profile Information */}
        <div className="as-section">
          <div className="as-section-label">
            <div
              className="as-section-icon"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <h2>Profile Information</h2>
              <p>Update your display name and profile picture.</p>
            </div>
          </div>

          <div
            style={{ display: "flex", gap: "20px", alignItems: "flex-start", marginTop: "1rem" }}
          >
            {isFetchingProfile ? (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  gap: "20px",
                  alignItems: "center",
                  animation: "pulse 1.5s infinite ease-in-out",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.05)",
                  }}
                />
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div
                    style={{
                      width: "120px",
                      height: "14px",
                      borderRadius: "4px",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      maxWidth: "300px",
                      height: "40px",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.05)",
                    }}
                  />
                  <div
                    style={{
                      width: "120px",
                      height: "36px",
                      borderRadius: "20px",
                      background: "rgba(255,255,255,0.05)",
                      marginTop: "4px",
                    }}
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Avatar Upload */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      background: "rgba(255,255,255,0.1)",
                      overflow: "hidden",
                      cursor: "pointer",
                      position: "relative",
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {profilePic ? (
                      <img
                        src={profilePic}
                        alt="Profile"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background:
                            "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                          color: "#fff",
                          fontSize: "32px",
                          fontWeight: "bold",
                          textTransform: "uppercase",
                        }}
                      >
                        {displayName ? displayName.charAt(0) : "?"}
                      </div>
                    )}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        fontSize: "10px",
                        textAlign: "center",
                        padding: "4px 0",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      EDIT
                    </div>
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ display: "none" }}
                  />
                </div>

                {/* Form Fields */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label
                      style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}
                    >
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "#fff",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        fontSize: "15px",
                        outline: "none",
                      }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "8px" }}
                  >
                    <button
                      className="as-btn as-btn--secondary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                      style={{ width: "fit-content", padding: "8px 20px" }}
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                    {saveStatus && (
                      <span
                        style={{
                          fontSize: "13px",
                          color: saveStatus.includes("Failed") ? "#ff4d4d" : "#4ade80",
                        }}
                      >
                        {saveStatus}
                      </span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Spotify Integration */}
        <div className="as-section">
          <div className="as-section-label">
            <div className="as-section-icon as-section-icon--spotify">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
            </div>
            <div>
              <h2>Spotify Integration</h2>
              <p>
                Unlink your Spotify account from Beatyx. Your listening history and playlists on
                Spotify won&apos;t be affected.
              </p>
            </div>
          </div>
          {spotifyDone ? (
            <div className="as-success">
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
              </svg>
              Spotify disconnected successfully.
              <Link to="/profile">Go to Profile</Link>
            </div>
          ) : (
            <button
              className="as-btn as-btn--secondary"
              onClick={handleDisconnectSpotify}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              {loading ? "Disconnecting…" : "Disconnect Spotify"}
            </button>
          )}
        </div>

        {/* Danger Zone */}
        <div className="as-section as-section--danger">
          <div className="as-section-label">
            <div className="as-section-icon as-section-icon--danger">
              <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <div>
              <h2>Danger Zone</h2>
              <p>
                Permanently delete your Beatyx account. This removes all your data — liked songs,
                playlists, and your profile — forever. There is no undo.
              </p>
            </div>
          </div>
          <button
            className="as-btn as-btn--danger"
            onClick={handleDeleteAccount}
            disabled={loading}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
            </svg>
            {loading ? "Deleting…" : "Delete My Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
