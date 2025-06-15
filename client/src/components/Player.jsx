// src/components/Player.jsx
import React, { Suspense } from 'react';
import ReactPlayer from 'react-player/youtube';
import prettyMilliseconds from 'pretty-ms';
import { Link } from 'react-router-dom';
import TrackLogo from '/Track-Logo.webp';
import musicWave from '../assets/media/wave.webm';
import '../assets/styles/Player.css';
import { useSharedPlayer } from '../context/PlayerContext';

const Player = () => {
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
    setIsPlayerReady,
  } = useSharedPlayer();

  return (
    <div className="player">
      <h2 className="track-heading">Now Playing</h2>

      <Link to="/track" className="track-info">
        <div className="thumbnail">
          <img
            src={trackInfo.imgSrc || TrackLogo}
            alt="Track Logo"
            aria-label="Track Logo"
          />
        </div>
        <span className="track-name">
          {trackInfo.trackName || '—'}
        </span>
      </Link>

      <button className="other-btn" aria-label="Shuffle">
        <i className="fa-solid fa-shuffle"></i>
      </button>

      <button
        className="backward-btn"
        onClick={handlePrev}
        aria-label="Previous Track"
      >
        <i className="fa-solid fa-backward-step"></i>
      </button>

      {isBuffering ? (
        <div
          className="play-pause-btn buffering-spinner"
          aria-label="Buffering"
        >
          <span className="spinner" />
        </div>
      ) : (
        <button
          className="play-pause-btn"
          onClick={togglePlayPause}
          disabled={!url}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <i className={`fa-solid ${playing ? 'fa-pause' : 'fa-play'}`}></i>
        </button>
      )}

      <button
        className="backward-btn"
        onClick={handleNext}
        aria-label="Next Track"
      >
        <i className="fa-solid fa-forward-step"></i>
      </button>

      <button className="other-btn" aria-label="Loop">
        <i className="fa-solid fa-repeat"></i>
      </button>

      <input
        type="range"
        min={0}
        max={1}
        step="0.01"
        value={isNaN(progress) ? 0 : progress}
        onChange={handleSeekChange}
        disabled={!url}
        aria-label="Seek"
      />

      <span className="duration-board">
        {prettyMilliseconds(Math.round(progress * duration) * 1000, {
          colonNotation: true,
          secondsDecimalDigits: 0,
        })}{' '}
        |{' '}
        {prettyMilliseconds(duration * 1000, {
          colonNotation: true,
          secondsDecimalDigits: 0,
        })}
      </span>

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
        id="volumeSlider"
        aria-label="Volume"
      />

      <div className="music-wave">
        {playing && (
          <video autoPlay loop muted src={musicWave} aria-label="Music Wave" />
        )}
      </div>

      {errorMessage && (
        <div className="error-message" role="alert">
          {errorMessage}
        </div>
      )}

      <Suspense fallback={null}>
        {url && (
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            width="0px"
            height="0px"
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
    </div>
  );
};

export default Player;