import { useState, Suspense, useEffect } from "react";
import prettyMilliseconds from "pretty-ms";
import TrackLogo from "/Track-Logo.webp";
import { useSharedPlayer } from "./useSharedPlayer";
import "./CurrentTrackButton.css";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import { useNavigate } from "react-router-dom";

const CurrentTrackButton = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);
  const navigate = useNavigate();

  const {
    // State
    url,
    trackInfo,
    playing,
    volume,
    progress,
    duration,
    isBuffering,
    errorMessage,

    // Refs
    playerRef,

    // Actions
    togglePlayPause,
    handleNext,
    handlePrev,
    handleSeekChange,

    // ReactPlayer handlers
    handleProgress,
    handleDuration,
    handleBuffer,
    handleBufferEnd,
    handleError,
    handleEnded,
    handlePlay,
    handlePause,
    handleReady,
  } = useSharedPlayer();

  // Helper function to remove focus from buttons
  const removeFocus = (e) => {
    if (e.currentTarget) {
      e.currentTarget.blur();
    }
  };

  // Format time helper
  const formatTime = (timeInSeconds) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return "0:00";
    return prettyMilliseconds(timeInSeconds * 1000, {
      colonNotation: true,
      secondsDecimalDigits: 0,
    });
  };

  // Get current and total time
  const currentTime = Math.round(progress * duration) || 0;
  const totalTime = Math.round(duration) || 0;

  const toggleDrawer = (e) => {
    if (e) removeFocus(e);
    setIsDrawerOpen(!isDrawerOpen);
  };

  // Enhanced handlers with focus removal
  const handlePlayPauseClick = (e) => {
    togglePlayPause();
    removeFocus(e);
  };

  const handleNextClick = (e) => {
    handleNext();
    removeFocus(e);
  };

  const handlePrevClick = (e) => {
    handlePrev();
    removeFocus(e);
  };

  const handleLoop = (e) => {
    setIsLoopEnabled(!isLoopEnabled);
    removeFocus(e);
  };

  const handleShuffle = (e) => {
    setIsShuffleEnabled(!isShuffleEnabled);
    removeFocus(e);
  };

  const handleShare = (e) => {
    removeFocus(e);
  };

  const handleMobileQueueNav = (e) => {
    removeFocus(e);
    setIsDrawerOpen(false); // Close drawer
    navigate("/queue");
  };

  return (
    <>
      {/* Floating Mini Player */}
      <div className="ctb-mini-player" onClick={toggleDrawer}>
        <div className="ctb-mini-left">
          <img src={trackInfo.imgSrc || TrackLogo} alt="cover" className="ctb-mini-art" />
          <div className="ctb-mini-info">
            <div className="ctb-mini-title">{trackInfo.trackName || "No track selected"}</div>
            <div className="ctb-mini-artist">
              {trackInfo.artistNames && trackInfo.artistNames.length > 0
                ? trackInfo.artistNames.map((item) => item?.name || item).join(", ")
                : "Unknown Artists"}
            </div>
          </div>
        </div>
        <div className="ctb-mini-right">
          <button
            className="ctb-mini-play-btn"
            onClick={(e) => {
              e.stopPropagation();
              handlePlayPauseClick(e);
            }}
          >
            {isBuffering ? (
              <div
                className="spinner-ring"
                style={{
                  width: 14,
                  height: 14,
                  borderWidth: 2,
                  borderColor: "rgba(0,0,0,0.2)",
                  borderTopColor: "#000",
                }}
              ></div>
            ) : (
              <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`}></i>
            )}
          </button>
        </div>
      </div>

      {/* Full Screen Drawer */}
      <div className={`player-drawer ${isDrawerOpen ? "open" : ""}`}>
        {/* Drawer Handle */}
        <div className="drawer-handle" onClick={toggleDrawer}>
          <div className="handle-bar"></div>
        </div>

        {/* Drawer Content */}
        <div className="drawer-content">
          {/* Header Row: Close Button & Queue Button */}
          <div className="drawer-header-row">
            <button className="close-btn" onClick={toggleDrawer}>
              <i className="fa-solid fa-chevron-down"></i>
            </button>
            <button className="mobile-queue-btn" onClick={handleMobileQueueNav}>
              <i className="fa-solid fa-list-ul"></i> Queue
            </button>
          </div>

          {/* Large Album Art */}
          <div className="large-artwork">
            <img src={trackInfo.imgSrc || TrackLogo} alt="Album artwork" />
          </div>

          {/* Track Details */}
          <div className="track-details">
            <h1 className="track-title">{trackInfo.trackName || "No track selected"}</h1>
            <p className="artist-title">
              {trackInfo.artistNames && trackInfo.artistNames.length > 0
                ? trackInfo.artistNames.map((item) => item?.name || item).join(", ")
                : "Unknown Artists"}
            </p>
          </div>

          {/* Progress Section */}
          <div className="progress-section-drawer">
            <input
              type="range"
              className="progress-slider-drawer"
              min="0"
              max="1"
              step="0.01"
              value={isNaN(progress) ? 0 : progress}
              onChange={handleSeekChange}
              disabled={!url}
              aria-label="Seek"
              style={{ "--progress": `${(isNaN(progress) ? 0 : progress) * 100}%` }}
            />
            <div className="time-display">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(totalTime)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="main-controls">
            <button
              className="control-btn drawer-prev-btn"
              onClick={handlePrevClick}
              disabled={!url}
              aria-label="Previous Track"
            >
              <i className="fa-solid fa-backward-step"></i>
            </button>

            <button
              className="control-btn play-btn-large"
              onClick={handlePlayPauseClick}
              disabled={!url}
              aria-label={playing ? "Pause" : "Play"}
            >
              {isBuffering ? (
                <div className="loading-spinner">
                  <div className="spinner-ring"></div>
                </div>
              ) : (
                <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`}></i>
              )}
            </button>

            <button
              className="control-btn drawer-next-btn"
              onClick={handleNextClick}
              disabled={!url}
              aria-label="Next Track"
            >
              <i className="fa-solid fa-forward-step"></i>
            </button>
          </div>

          {/* Secondary Controls */}
          <div className="secondary-controls">
            <button
              className={`control-btn secondary-btn ${isLoopEnabled ? "active" : ""}`}
              onClick={handleLoop}
              disabled={!url}
              aria-label="Toggle Loop"
            >
              <i className="fa-solid fa-repeat"></i>
            </button>

            <button
              className={`control-btn secondary-btn ${isShuffleEnabled ? "active" : ""}`}
              onClick={handleShuffle}
              disabled={!url}
              aria-label="Toggle Shuffle"
            >
              <i className="fa-solid fa-shuffle"></i>
            </button>

            <button
              className="control-btn secondary-btn"
              onClick={handleShare}
              disabled={!url}
              aria-label="Share Track"
            >
              <i className="fa-solid fa-share"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isDrawerOpen && <div className="ctb-drawer-backdrop" onClick={toggleDrawer}></div>}

      {/* Error Message */}
      {errorMessage && (
        <div className="error-toast" role="alert">
          <i className="fa-solid fa-exclamation-triangle"></i>
          {errorMessage}
        </div>
      )}
    </>
  );
};

export default CurrentTrackButton;
