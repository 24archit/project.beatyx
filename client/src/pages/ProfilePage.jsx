import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile } from "@/services/userService";
import { verifyAuth } from "@/features/auth/authService";
import "../assets/styles/ProfilePage.css";

const ProfileSkeleton = () => {
  return (
    <div className="custom-profile-page">
      <div className="profile-container-main">
        {/* --- 1. HERO SKELETON --- */}
        <div className="hero-section-premium animate-stagger-1">
          <div className="hero-content-flex">
            <div className="hero-avatar-block">
              <div className="sk-box sk-avatar"></div>
            </div>

            <div className="hero-info-block">
              <div className="badges-row">
                <div className="sk-box sk-badge"></div>
                <div className="sk-box sk-badge"></div>
              </div>

              <div className="sk-box sk-title"></div>
              <div className="sk-box sk-text-sm" style={{ width: "200px" }}></div>

              <div className="p-stats-row" style={{ marginTop: "1.5rem" }}>
                <div className="sk-box sk-pill"></div>
                <div className="sk-box sk-pill"></div>
              </div>

              <div className="sk-box sk-btn" style={{ marginTop: "2rem" }}></div>
            </div>
          </div>
        </div>

        {/* --- 2. DASHBOARD SKELETON --- */}
        <div className="dashboard-layout">
          <div className="spotify-status-box animate-stagger-2">
            <div className="box-header">
              <div className="sk-box sk-icon-circle"></div>
              <div className="sk-box sk-dot"></div>
            </div>
            <div className="sk-box sk-rect-lg"></div>
            <div className="sp-info-grid">
              <div className="sk-box sk-rect-md"></div>
              <div className="sk-box sk-rect-md"></div>
            </div>
          </div>

          <div className="data-feed-column">
            <div className="feed-section animate-stagger-3">
              <div className="feed-header">
                <div className="sk-box sk-header-text"></div>
              </div>
              <div className="custom-artist-grid">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="custom-artist-card">
                    <div className="sk-box sk-artist-img"></div>
                    <div className="sk-box sk-text-center"></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feed-section animate-stagger-4">
              <div className="feed-header">
                <div className="sk-box sk-header-text"></div>
              </div>
              <div className="custom-track-list">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="custom-track-row">
                    <div className="sk-box sk-track-idx"></div>
                    <div className="sk-box sk-track-thumb"></div>
                    <div className="c-track-info">
                      <div
                        className="sk-box sk-text-md"
                        style={{ width: "70%", marginBottom: "6px" }}
                      ></div>
                      <div className="sk-box sk-text-sm" style={{ width: "40%" }}></div>
                    </div>
                    <div className="sk-box sk-text-sm" style={{ width: "40px" }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getUserProfile();
        setData(response);
      } catch (error) {
        if (error.response?.status === 401) navigate("/");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  if (loading) return <ProfileSkeleton />;
  if (!data) return null;

  const { user, spotify } = data;
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

  return (
    <div className="custom-profile-page">
      <div className="profile-container-main">
        {/* --- 1. THE SWEEPING BANNER HERO SECTION --- */}
        <div className="hero-section-premium animate-stagger-1">
          <div className="hero-content-flex">
            <div className="hero-avatar-block">
              <img
                src={user.profilePic || "/profile-pic.webp"}
                alt={user.displayName}
                className="custom-avatar"
              />
              <div className="online-ring"></div>
            </div>

            <div className="hero-info-block">
              <div className="badges-row">
                <span className="p-badge beatyx-badge">MEMBER</span>
                {spotify.isConnected && (
                  <span className="p-badge spotify-badge">SPOTIFY LINKED</span>
                )}
              </div>

              <h1 className="p-username">{user.displayName}</h1>
              <div className="p-email">
                <i className="fa-solid fa-envelope"></i> {user.email}
              </div>

              <div className="p-stats-row">
                <div className="glass-pill-stat">
                  <span className="val">{user.followers || 0}</span>
                  <span className="lbl">Followers</span>
                </div>
                <div className="glass-pill-stat">
                  <span className="val">{user.country || "IN"}</span>
                  <span className="lbl">Region</span>
                </div>
              </div>

              <button className="btn btn-primary btn-open-playlist" onClick={() => navigate("/myplaylist")}>
                OPEN MY PLAYLISTS
              </button>
            </div>
          </div>
        </div>

        {/* --- 2. SPOTIFY HUB & DATA FEEDS --- */}
        <div className="dashboard-layout">
          {/* LEFT COLUMN: Spotify Hub */}
          <div className="spotify-status-box animate-stagger-2">
            <div className="box-header">
              <img src="/Spotify_logo.webp" alt="Spotify" className="sp-logo-icon" />
              <div className={`connection-dot ${spotify.isConnected ? "active" : ""}`}></div>
            </div>

            {spotify.isConnected ? (
              <div className="sp-profile-view">
                <div className="sp-mini-header">
                  <img src={spotify.profile.images?.[0]?.url} alt="" />
                  <div>
                    <h4>{spotify.profile.display_name}</h4>
                    <p>{spotify.profile.product} Plan</p>
                  </div>
                </div>
                <div className="sp-info-grid">
                  <div className="sp-info-item">
                    <label>Spotify Followers</label>
                    <span>{spotify.profile.followers.total}</span>
                  </div>
                  <div className="sp-info-item">
                    <label>Market</label>
                    <span>{spotify.profile.country}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="sp-connect-view">
                <h3>Sync Required</h3>
                <p>Connect to unlock your premium Top Artists and Tracks analysis.</p>
                <button className="btn btn-primary" style={{width: '100%'}} onClick={handleClickOpen}>
                  CONNECT NOW
                </button>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Interactive Data Feeds */}
          <div className="data-feed-column">
            {spotify.isConnected ? (
              <>
                {/* VINYL ARTISTS GRID */}
                <div className="animate-stagger-3">
                  <div className="feed-header">
                    <h3>
                      <i className="fa-solid fa-star"></i> Top Artists
                    </h3>
                  </div>
                  <div className="custom-artist-grid">
                    {spotify.topArtists?.slice(0, 4).map((artist, i) => (
                      <div
                        key={artist.id}
                        className="custom-artist-card"
                        onClick={() => navigate(`/artist/${artist.id}`)}
                      >
                        <div className="c-artist-img">
                          <img src={artist.images?.[1]?.url || artist.images?.[0]?.url} alt="" />
                          <div className="rank-tag">#{i + 1}</div>
                        </div>
                        <div className="c-artist-name">{artist.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEAMLESS TRACKS LIST */}
                <div className="animate-stagger-4" style={{ marginTop: '1rem' }}>
                  <div className="feed-header">
                    <h3>
                      <i className="fa-solid fa-music"></i> Top Tracks
                    </h3>
                  </div>
                  <div className="custom-track-list">
                    {spotify.topTracks?.slice(0, 5).map((track, i) => (
                      <div
                        key={track.id}
                        className="custom-track-row"
                        onClick={() => navigate(`/track/${track.id}`)}
                      >
                        <span className="c-track-idx">{i + 1}</span>
                        <img src={track.album?.images?.[2]?.url} alt="" className="c-track-thumb" />
                        <div className="c-track-info">
                          <div className="c-t-name">{track.name}</div>
                          <div className="c-t-artist">{track.artists?.[0].name}</div>
                        </div>
                        <div className="c-track-time">
                          {Math.floor(track.duration_ms / 60000)}:
                          {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, "0")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state-box animate-stagger-3">
                <i className="fa-solid fa-chart-simple" style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }}></i>
                <h3>Data Unavailable</h3>
                <p>Please connect your Spotify account to see your data feeds.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
