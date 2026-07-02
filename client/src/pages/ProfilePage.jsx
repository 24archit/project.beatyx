import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "@/services/userService";
import { verifyAuth } from "@/features/auth/authService";
import "../assets/styles/ProfilePage.css";

/* ─── Skeleton ──────────────────────────────────────────────── */
const ProfileSkeleton = () => (
  <div className="pp-page">
    <div className="pp-hero sk-hero">
      <div className="pp-hero-inner">
        <div
          className="sk-box"
          style={{ width: 130, height: 130, borderRadius: "50%", flexShrink: 0 }}
        />
        <div className="pp-hero-text" style={{ flex: 1 }}>
          <div
            className="sk-box"
            style={{ width: 80, height: 22, borderRadius: 20, marginBottom: 12 }}
          />
          <div
            className="sk-box"
            style={{ width: "55%", height: 42, borderRadius: 10, marginBottom: 10 }}
          />
          <div
            className="sk-box"
            style={{ width: "35%", height: 18, borderRadius: 8, marginBottom: 20 }}
          />
          <div style={{ display: "flex", gap: 10 }}>
            <div className="sk-box" style={{ width: 120, height: 36, borderRadius: 20 }} />
            <div className="sk-box" style={{ width: 100, height: 36, borderRadius: 20 }} />
          </div>
        </div>
      </div>
    </div>
    <div style={{ padding: "0 0 2rem" }}>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          paddingBottom: 12,
        }}
      >
        <div className="sk-box" style={{ width: 90, height: 38, borderRadius: 20 }} />
        <div className="sk-box" style={{ width: 90, height: 38, borderRadius: 20 }} />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {[1, 2].map((i) => (
          <div key={i} className="sk-box" style={{ height: 72, borderRadius: 14 }} />
        ))}
      </div>
    </div>
  </div>
);

/* ─── Main Component ─────────────────────────────────────────── */
const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("beatyx");

  const {
    data,
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, err) => {
      if (err?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (error?.response?.status === 401) {
      navigate("/");
    }
  }, [error, navigate]);

  if (loading) return <ProfileSkeleton />;
  if (!data) return null;

  const { user, spotify } = data;
  const displayName = user.displayName || user.email.split("@")[0];

  const handleConnectSpotify = async () => {
    try {
      const authToken = localStorage.getItem("authToken");
      if (!authToken) {
        alert("🔐 Please log in to connect Spotify.");
        return;
      }
      const response = await verifyAuth(authToken);
      if (response.isVerified) {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { Browser } = await import("@capacitor/browser");
          await Browser.open({
            url: `${import.meta.env.VITE_SERVER_LINK}/auth/api/connectSpotify?authToken=${authToken}&appRedirect=beatyx://callback`,
          });
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
      }
    } catch (e) {
      alert("⚠️ Something went wrong. Please try again.");
    }
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Are you sure you want to logout?");
    if (!confirmed) return;
    window.localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="pp-page">
      {/* ── HERO BANNER ── */}
      <div className="pp-hero">
        <div className="pp-hero-glow" />
        <div className="pp-hero-inner">
          <div className="pp-avatar-wrap">
            {user.profilePic ? (
              <img className="pp-avatar" src={user.profilePic} alt={displayName} />
            ) : (
              <div
                className="pp-avatar"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, var(--accent-purple), var(--accent-blue))",
                  color: "#fff",
                  fontSize: "48px",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                }}
              >
                {displayName ? displayName.charAt(0) : "?"}
              </div>
            )}
          </div>

          <div className="pp-hero-text">
            <div className="pp-badges">
              <span className="pp-badge pp-badge--beatyx">BEATYX MEMBER</span>
              {spotify.isConnected && (
                <span className="pp-badge pp-badge--spotify">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  SPOTIFY LINKED
                </span>
              )}
            </div>

            <h1 className="pp-name">{displayName}</h1>
            <p className="pp-email">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
              {user.email}
            </p>

            <div className="pp-hero-actions">
              <button className="btn btn-primary" onClick={() => navigate("/liked-songs")}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                Liked Songs
              </button>
              <button className="btn btn-ghost" onClick={() => navigate("/settings")}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                </svg>
                Settings
              </button>
              <button className="btn btn-ghost" style={{ color: "#f87171" }} onClick={handleLogout}>
                <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="pp-tabs">
        <button
          className={`pp-tab-btn${activeTab === "beatyx" ? " active" : ""}`}
          onClick={() => setActiveTab("beatyx")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
          </svg>
          Beatyx
        </button>
        <button
          className={`pp-tab-btn${activeTab === "spotify" ? " active" : ""}`}
          onClick={() => setActiveTab("spotify")}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Spotify
        </button>
      </div>

      {/* ── TAB CONTENT ── */}
      <div className="pp-tab-body">
        {/* ── BEATYX TAB ── */}
        {activeTab === "beatyx" && (
          <div className="pp-folder-grid">
            {/* Liked Songs card */}
            <div className="pp-folder-card" onClick={() => navigate("/liked-songs")}>
              <div className="pp-fc-icon pp-fc-icon--heart">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
              <div className="pp-fc-info">
                <h3>Liked Songs</h3>
                {user.likedSongs?.length > 0 ? (
                  <p>{user.likedSongs.length} tracks saved</p>
                ) : (
                  <p className="pp-no-data">No liked songs yet</p>
                )}
              </div>
              <svg
                className="pp-fc-arrow"
                viewBox="0 0 24 24"
                fill="currentColor"
                width="18"
                height="18"
              >
                <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" />
              </svg>
            </div>

            {/* Playlists card */}
            <div className="pp-folder-card pp-folder-card--disabled">
              <div className="pp-fc-icon pp-fc-icon--playlist">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                </svg>
              </div>
              <div className="pp-fc-info">
                <h3>My Playlists</h3>
                <p className="pp-no-data">Coming soon — playlist management</p>
              </div>
              <span className="pp-soon-badge">Soon</span>
            </div>
          </div>
        )}

        {/* ── SPOTIFY TAB ── */}
        {activeTab === "spotify" && (
          <div>
            {!spotify.isConnected ? (
              <div className="pp-sp-connect">
                <div className="pp-sp-connect-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                </div>
                <h2>Connect Spotify</h2>
                <p>
                  Link your Spotify account to see your top artists, top tracks, and personalised
                  stats right here in Beatyx.
                </p>
                <button className="btn btn-spotify" onClick={handleConnectSpotify}>
                  Connect Now
                </button>
              </div>
            ) : (
              <>
                {/* Spotify profile banner */}
                <div className="pp-sp-banner">
                  <img
                    className="pp-sp-avatar"
                    src={spotify.profile.images?.[0]?.url || "/profile-pic.webp"}
                    alt={spotify.profile.display_name}
                  />
                  <div>
                    <p className="pp-sp-label">Spotify Account</p>
                    <h2 className="pp-sp-name">{spotify.profile.display_name}</h2>
                    <div className="pp-sp-meta">
                      <span className="pp-sp-chip">{spotify.profile.product} Plan</span>
                      <span className="pp-sp-chip">
                        {spotify.profile.followers?.total?.toLocaleString()} Followers
                      </span>
                      {spotify.profile.country && (
                        <span className="pp-sp-chip">{spotify.profile.country}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Artists */}
                <div className="pp-sp-section">
                  <h3 className="pp-sp-section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    Top Artists
                  </h3>
                  {spotify.topArtists?.length > 0 ? (
                    <div className="pp-artist-grid">
                      {spotify.topArtists.slice(0, 12).map((artist, i) => (
                        <div
                          key={artist.id}
                          className="pp-artist-card"
                          onClick={() => navigate(`/artist/${artist.id}`)}
                        >
                          <div className="pp-artist-img-wrap">
                            <img
                              src={artist.images?.[1]?.url || artist.images?.[0]?.url}
                              alt={artist.name}
                            />
                            <span className="pp-rank">#{i + 1}</span>
                          </div>
                          <p className="pp-artist-name">{artist.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pp-no-data pp-no-data--center">Not enough data to show</p>
                  )}
                </div>

                {/* Top Tracks */}
                <div className="pp-sp-section">
                  <h3 className="pp-sp-section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    Top Tracks
                  </h3>
                  {spotify.topTracks?.length > 0 ? (
                    <div className="pp-track-list">
                      {spotify.topTracks.slice(0, 10).map((track, i) => (
                        <div
                          key={track.id}
                          className="pp-track-row"
                          onClick={() => navigate(`/track/${track.id}`)}
                        >
                          <span className="pp-track-idx">{i + 1}</span>
                          <img
                            className="pp-track-thumb"
                            src={track.album?.images?.[2]?.url}
                            alt={track.name}
                          />
                          <div className="pp-track-info">
                            <p className="pp-track-name">{track.name}</p>
                            <p className="pp-track-artist">{track.artists?.[0]?.name}</p>
                          </div>
                          <span className="pp-track-dur">
                            {Math.floor(track.duration_ms / 60000)}:
                            {String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(
                              2,
                              "0"
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pp-no-data pp-no-data--center">Not enough data to show</p>
                  )}
                </div>

                {/* Followed Artists */}
                <div className="pp-sp-section">
                  <h3 className="pp-sp-section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                    Followed Artists
                  </h3>
                  {spotify.followedArtists?.length > 0 ? (
                    <div className="pp-artist-grid">
                      {spotify.followedArtists.slice(0, 12).map((artist) => (
                        <div
                          key={artist.id}
                          className="pp-artist-card"
                          onClick={() => navigate(`/artist/${artist.id}`)}
                        >
                          <div className="pp-artist-img-wrap">
                            <img
                              src={
                                artist.images?.[1]?.url ||
                                artist.images?.[0]?.url ||
                                "/profile-pic.webp"
                              }
                              alt={artist.name}
                            />
                          </div>
                          <p className="pp-artist-name">{artist.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pp-no-data pp-no-data--center">Not enough data to show</p>
                  )}
                </div>

                {/* Saved Tracks */}
                <div className="pp-sp-section">
                  <h3 className="pp-sp-section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    Saved Tracks
                  </h3>
                  {spotify.savedTracks?.length > 0 ? (
                    <div className="pp-track-list">
                      {spotify.savedTracks.slice(0, 10).map((item, i) => (
                        <div
                          key={item.track.id}
                          className="pp-track-row"
                          onClick={() => navigate(`/track/${item.track.id}`)}
                        >
                          <span className="pp-track-idx">{i + 1}</span>
                          <img
                            className="pp-track-thumb"
                            src={item.track.album?.images?.[2]?.url || "/profile-pic.webp"}
                            alt={item.track.name}
                          />
                          <div className="pp-track-info">
                            <p className="pp-track-name">{item.track.name}</p>
                            <p className="pp-track-artist">{item.track.artists?.[0]?.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pp-no-data pp-no-data--center">Not enough data to show</p>
                  )}
                </div>

                {/* Playlists */}
                <div className="pp-sp-section">
                  <h3 className="pp-sp-section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z" />
                    </svg>
                    Playlists
                  </h3>
                  {spotify.playlists?.length > 0 ? (
                    <div className="pp-artist-grid">
                      {spotify.playlists.slice(0, 12).map((playlist) => (
                        <div
                          key={playlist.id}
                          className="pp-artist-card"
                          onClick={() => navigate(`/playlist/${playlist.id}`)}
                        >
                          <div
                            className="pp-artist-img-wrap"
                            style={{ borderRadius: "12px", overflow: "hidden" }}
                          >
                            <img
                              src={playlist.images?.[0]?.url || "/profile-pic.webp"}
                              alt={playlist.name}
                              style={{
                                borderRadius: "12px",
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                          <p className="pp-artist-name">{playlist.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pp-no-data pp-no-data--center">Not enough data to show</p>
                  )}
                </div>

                {/* Saved Albums */}
                <div className="pp-sp-section">
                  <h3 className="pp-sp-section-title">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z" />
                    </svg>
                    Saved Albums
                  </h3>
                  {spotify.savedAlbums?.length > 0 ? (
                    <div className="pp-artist-grid">
                      {spotify.savedAlbums.slice(0, 12).map((item) => (
                        <div
                          key={item.album.id}
                          className="pp-artist-card"
                          onClick={() => navigate(`/album/${item.album.id}`)}
                        >
                          <div
                            className="pp-artist-img-wrap"
                            style={{ borderRadius: "12px", overflow: "hidden" }}
                          >
                            <img
                              src={
                                item.album.images?.[1]?.url ||
                                item.album.images?.[0]?.url ||
                                "/profile-pic.webp"
                              }
                              alt={item.album.name}
                              style={{
                                borderRadius: "12px",
                                objectFit: "cover",
                                width: "100%",
                                height: "100%",
                              }}
                            />
                          </div>
                          <p className="pp-artist-name">{item.album.name}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="pp-no-data pp-no-data--center">Not enough data to show</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
