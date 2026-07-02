// client/src/components/Side.jsx
// Hamburger menu that opens a slide-in overlay drawer (pure CSS, no MUI permanent sidebar)
import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import "../assets/styles/Side.css";

export default function Side({ isAuth, isSpotifyConnected }) {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const navigate = useNavigate();

  const authToken = window.localStorage.getItem("authToken");

  const toggleDrawer = () => setIsOpen((prev) => !prev);
  const closeDrawer = () => setIsOpen(false);

  // Close drawer on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        closeDrawer();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when drawer is open
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") closeDrawer();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const menuItems = [
    {
      label: "Home",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      ),
      to: "/",
      public: true,
    },

    {
      label: "Profile",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
        </svg>
      ),
      to: "/profile",
      authRequired: true,
      alertMsg: "Please sign up or login to view your Profile!",
    },
    {
      label: "Liked Songs",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ),
      to: "/liked-songs",
      authRequired: true,
      alertMsg: "Please sign up or login to access your Liked Songs!",
    },
  ];

  const handleAlert = (msg) => {
    alert(msg || "Please login first!");
    closeDrawer();
  };

  return (
    <>
      {/* Hamburger Trigger Button */}
      <button
        className="nav-hamburger"
        onClick={toggleDrawer}
        aria-label={isOpen ? "Close menu" : "Open menu"}
        aria-expanded={isOpen}
      >
        {isOpen ? (
          /* X icon */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          /* Hamburger icon */
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        )}
      </button>

      {/* Portal the drawer to the body so it escapes the NavBar stacking context */}
      {createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`drawer-backdrop ${isOpen ? "drawer-backdrop--open" : ""}`}
            onClick={closeDrawer}
            aria-hidden="true"
          />

          {/* Slide Drawer */}
          <aside
            ref={drawerRef}
            className={`side-drawer ${isOpen ? "side-drawer--open" : ""}`}
            aria-label="Navigation menu"
          >
            {/* Drawer Header */}
            <div className="drawer-header">
              <Logo />
              <button className="drawer-close-btn" onClick={closeDrawer} aria-label="Close menu">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Nav Links */}
            <nav className="drawer-nav">
              {menuItems.map((item) => {
                const isRestricted = item.authRequired && !authToken;

                if (isRestricted) {
                  return (
                    <button
                      key={item.label}
                      className="drawer-nav-item drawer-nav-item--restricted"
                      onClick={() => handleAlert(item.alertMsg)}
                    >
                      <span className="drawer-nav-icon">{item.icon}</span>
                      <span className="drawer-nav-label">{item.label}</span>
                      <span className="drawer-nav-lock">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
                        </svg>
                      </span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    to={item.to}
                    className="drawer-nav-item"
                    onClick={closeDrawer}
                  >
                    <span className="drawer-nav-icon">{item.icon}</span>
                    <span className="drawer-nav-label">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth section inside drawer (shown on mobile) */}
            <div className="drawer-auth-section">
              {!isAuth ? (
                <>
                  <p className="drawer-auth-label">Join the music</p>
                  <div className="drawer-auth-buttons">
                    <Link
                      to="#"
                      className="drawer-auth-btn drawer-auth-btn--login"
                      onClick={(e) => {
                        e.preventDefault();
                        closeDrawer();
                        // trigger LoginBtn programmatically — use a custom event
                        document.dispatchEvent(new CustomEvent("openLoginDialog"));
                      }}
                    >
                      Login
                    </Link>
                    <Link
                      to="#"
                      className="drawer-auth-btn drawer-auth-btn--signup"
                      onClick={(e) => {
                        e.preventDefault();
                        closeDrawer();
                        document.dispatchEvent(new CustomEvent("openSignupDialog"));
                      }}
                    >
                      Sign Up
                    </Link>
                  </div>
                  <button
                    className="drawer-spotify-btn"
                    onClick={() => {
                      closeDrawer();
                      document.dispatchEvent(new CustomEvent("connectSpotify"));
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                    Connect Spotify
                  </button>
                </>
              ) : !isSpotifyConnected ? (
                <button
                  className="drawer-spotify-btn"
                  onClick={() => {
                    closeDrawer();
                    document.dispatchEvent(new CustomEvent("connectSpotify"));
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  Connect Spotify
                </button>
              ) : (
                <div className="drawer-spotify-connected">
                  <svg viewBox="0 0 24 24" fill="#1db954" width="16" height="16">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  <span>Spotify Connected</span>
                </div>
              )}
            </div>
          </aside>
        </>,
        document.body
      )}
    </>
  );
}
