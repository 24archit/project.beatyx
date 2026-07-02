// src/components/Player.jsx
import { Suspense, useState, useEffect } from "react";
import prettyMilliseconds from "pretty-ms";
import { Link } from "react-router-dom";
import "./Player.css";
import { useSharedPlayer } from "./useSharedPlayer";
import { AnimatedWave } from "./AnimatedWave";
import { DefaultTrackIcon } from "./DefaultTrackIcon";
import { QueueList } from "../../components/QueueList";

const Player = () => {
  const [isDesktopQueueOpen, setIsDesktopQueueOpen] = useState(false);

  const toggleDesktopQueue = (e) => {
    e.stopPropagation();
    setIsDesktopQueueOpen(!isDesktopQueueOpen);
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      if (isDesktopQueueOpen) {
        setIsDesktopQueueOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isDesktopQueueOpen]);

  const {
    // State
    url,
    trackInfo,
    volume,
    setVolume,
    playing,
    progress,
    duration,
    isBuffering,
    errorMessage,

    // Refs
    playerRef,
    volumeSliderRef,

    // Computed
    volumeIcon,

    // Actions
    togglePlayPause,
    handleNext,
    handlePrev,
    handleSeekChange,
    handleVolumeChange,

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
  const trackLink = trackInfo?.id ? `/track/${trackInfo.id}` : "#";
  return (
    <div className="player">
      <div className="player-left">
        <Link to={trackLink} className="track-info">
          <div className="thumbnail">
            {trackInfo?.imgSrc ? (
              <img src={trackInfo.imgSrc} alt="Track Logo" aria-label="Track Logo" />
            ) : (
              <DefaultTrackIcon />
            )}
          </div>
          <span className="track-name">{trackInfo?.trackName || "—"}</span>
        </Link>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="other-btn" aria-label="Shuffle">
            <i className="fa-solid fa-shuffle"></i>
          </button>
          <button className="backward-btn" onClick={handlePrev} aria-label="Previous Track">
            <i className="fa-solid fa-backward-step"></i>
          </button>

          {isBuffering ? (
            <div className="play-pause-btn buffering-spinner" aria-label="Buffering">
              <span className="spinner" />
            </div>
          ) : (
            <button
              className="play-pause-btn"
              onClick={togglePlayPause}
              disabled={!url}
              aria-label={playing ? "Pause" : "Play"}
            >
              <i className={`fa-solid ${playing ? "fa-pause" : "fa-play"}`}></i>
            </button>
          )}

          <button className="backward-btn" onClick={handleNext} aria-label="Next Track">
            <i className="fa-solid fa-forward-step"></i>
          </button>
          <button className="other-btn" aria-label="Loop">
            <i className="fa-solid fa-repeat"></i>
          </button>
        </div>

        <div className="player-progress">
          <span className="duration-text">
            {prettyMilliseconds(Math.round(progress * duration) * 1000, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}
          </span>
          <input
            type="range"
            min={0}
            max={1}
            step="0.01"
            value={isNaN(progress) ? 0 : progress}
            onChange={handleSeekChange}
            disabled={!url}
            aria-label="Seek"
            className="seek-bar"
            style={{ "--progress": `${(isNaN(progress) ? 0 : progress) * 100}%` }}
          />
          <span className="duration-text">
            {prettyMilliseconds(duration * 1000, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}
          </span>
        </div>
      </div>

      <div className="player-right">
        <div
          className="volume-icon-container"
          onClick={() => setVolume((v) => (v === 0 ? 0.8 : 0))}
          aria-label="Toggle Mute"
        >
          <i className={`fa-solid ${volumeIcon} volume-icon`}></i>
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          ref={volumeSliderRef}
          className="volumeSlider"
          aria-label="Volume"
          style={{ "--progress": `${volume * 100}%` }}
        />
        <div className="music-wave-container">
          <AnimatedWave playing={playing} />
        </div>
      </div>

      {errorMessage && (
        <div className="error-message" role="alert">
          {errorMessage}
        </div>
      )}

      {/* Desktop Queue Toggle Tab (Top Right Edge) */}
      <button
        className={`queue-edge-tab ${isDesktopQueueOpen ? "open" : ""}`}
        onClick={toggleDesktopQueue}
        aria-label="Toggle Queue Drawer"
      >
        <i className="fa-solid fa-list-ul"></i>
        <span>Queue</span>
        <i
          className={`fa-solid ${isDesktopQueueOpen ? "fa-chevron-down" : "fa-chevron-up"}`}
          style={{ marginLeft: "4px", fontSize: "0.85em" }}
        ></i>
      </button>

      {/* Desktop Queue Drawer (Floating above player) */}
      <div
        className={`desktop-queue-drawer ${isDesktopQueueOpen ? "open" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="desktop-queue-header">
          <h3>Play Next</h3>
          <button className="desktop-queue-close" onClick={toggleDesktopQueue}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="desktop-queue-content">
          <QueueList />
        </div>
      </div>
    </div>
  );
};

export default Player;
