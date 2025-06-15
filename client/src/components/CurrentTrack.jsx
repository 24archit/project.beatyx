import React, { useState, Suspense } from "react";
import ReactPlayer from "react-player/youtube";
import prettyMilliseconds from "pretty-ms";
import TrackLogo from "/Track-Logo.webp";
import { useSharedPlayer } from "../context/PlayerContext";
import "../assets/styles/CurrentTrackButton.css";
import MusicNoteIcon from "@mui/icons-material/MusicNote";

const CurrentTrackButton = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoopEnabled, setIsLoopEnabled] = useState(false);
  const [isShuffleEnabled, setIsShuffleEnabled] = useState(false);

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
    setIsDrawerOpen(!isDrawerOpen);
    removeFocus(e);
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
    console.log("Loop toggled:", !isLoopEnabled);
    setIsLoopEnabled(!isLoopEnabled);
    removeFocus(e);
  };

  const handleShuffle = (e) => {
    console.log("Shuffle toggled:", !isShuffleEnabled);
    setIsShuffleEnabled(!isShuffleEnabled);
    removeFocus(e);
  };

  const handleShare = (e) => {
    console.log("Share button clicked for track:", trackInfo.trackName);
    console.log("Track URL:", url);
    console.log("Artist:", trackInfo.artistNames?.map(artist => artist.name).join(", "));
    removeFocus(e);
  };

  return (
    <>
      {/* Hidden ReactPlayer */}
      <Suspense fallback={null}>
        {url && (
          <ReactPlayer
            key={url}
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            width="0"
            height="0"
            pip
            config={{
              youtube: {
                playerVars: {
                  autoplay: 1,
                  controls: 0,
                  modestbranding: 1,
                  origin: window.location.origin,
                  disableRemotePlayback: 1,
                },
              },
            }}
            onReady={handleReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onDuration={handleDuration}
            onEnded={handleEnded}
            onError={handleError}
            onProgress={handleProgress}
            onBuffer={handleBuffer}
            onBufferEnd={handleBufferEnd}
          />
        )}
      </Suspense>

      {/* Floating FAB */}
      <div
        className={`ctb-fab ${playing ? "ctb-playing" : ""}`}
        onClick={toggleDrawer}
      >
        <MusicNoteIcon sx={{ fontSize: 30, color: "white" }} />
      </div>

      {/* Full Screen Drawer */}
      <div className={`player-drawer ${isDrawerOpen ? "open" : ""}`}>
        {/* Drawer Handle */}
        <div className="drawer-handle" onClick={toggleDrawer}>
          <div className="handle-bar"></div>
        </div>

        {/* Drawer Content */}
        <div className="drawer-content">
          {/* Close Button */}
          <button className="close-btn" onClick={toggleDrawer}>
            <i className="fa-solid fa-chevron-down"></i>
          </button>

          {/* Large Album Art */}
          <div className="large-artwork">
            <img src={trackInfo.imgSrc || TrackLogo} alt="Album artwork" />
          </div>

          {/* Track Details */}
          <div className="track-details">
            <h1 className="track-title">
              {trackInfo.trackName || "No track selected"}
            </h1>
            <p className="artist-title">
              {trackInfo.artistNames && trackInfo.artistNames.length > 0
                ? trackInfo.artistNames.map((item) => item.name).join(", ")
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
                <i
                  className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`}
                ></i>
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
      {isDrawerOpen && (
        <div className="drawer-backdrop" onClick={toggleDrawer}></div>
      )}

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