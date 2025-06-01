import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import ReactPlayer from "react-player/youtube";
import prettyMilliseconds from "pretty-ms";
import { Link } from "react-router-dom";
import { Suspense } from "react";
import TrackLogo from "../assets/media/Track-Logo.webp";
import musicWave from "../assets/media/wave.webm";
import "../assets/styles/Player.css";
import { getNextAudioLink, getPreviousAudioLink } from "../apis/apiFunctions";

// Custom hook: Throttle a callback execution to at most once per delay period
function useThrottle(callback, delay) {
  const lastCallRef = useRef(0);
  return useCallback(
    (...args) => {
      const now = Date.now();
      if (now - lastCallRef.current >= delay) {
        lastCallRef.current = now;
        callback(...args);
      }
    },
    [callback, delay]
  );
}

const Player = ({ url, trackInfo, setPlayerMeta, setTrackInfo }) => {
  // Core states
  const [volume, setVolume] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // value from 0 to 1
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  // Buffering & error state
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Prefetch and transition states
  const [nextTrackInfo, setNextTrackInfo] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skipNextEnded, setSkipNextEnded] = useState(false);

  // State to track if user is seeking (dragging the slider)
  const [isSeeking, setIsSeeking] = useState(false);

  const playerRef = useRef(null);
  const volumeSliderRef = useRef(null);

  // Helper: Extract video ID from a YouTube URL
  const extractVideoId = useCallback((videoUrl) => {
    if (!videoUrl) return null;
    try {
      const urlObj = new URL(videoUrl);
      const hostname = urlObj.hostname;
      if (hostname === "youtu.be") return urlObj.pathname.slice(1);
      if (hostname.includes("youtube.com")) {
        let v = urlObj.searchParams.get("v") || urlObj.searchParams.get("vi");
        if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
        const segments = urlObj.pathname.split("/");
        for (let seg of segments) {
          if (seg.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(seg)) return seg;
        }
        if (urlObj.hash) {
          const hashSegments = urlObj.hash.substring(1).split("/");
          for (let seg of hashSegments) {
            if (seg.length === 11 && /^[a-zA-Z0-9_-]{11}$/.test(seg))
              return seg;
          }
        }
      }
    } catch (error) {
      console.error("Error extracting video ID:", error);
    }
    return null;
  }, []);

  // Helper: Get the queue ID from sessionStorage
  const getQueueId = useCallback(() => {
    try {
      return window.sessionStorage.getItem("queueId");
    } catch (error) {
      console.error("Error accessing sessionStorage:", error);
      return null;
    }
  }, []);

  // Helper: Safely retrieve the internal player if available
  const getInternalPlayer = useCallback(() => {
    if (
      playerRef.current &&
      typeof playerRef.current.getInternalPlayer === "function"
    ) {
      return playerRef.current.getInternalPlayer();
    }
    console.warn("Internal player is not available.");
    return null;
  }, []);

  // Consolidated helper to load a track (used for next & previous)
  const loadTrack = useCallback(
    (trackUrl, trackDetails) => {
      const internalPlayer = getInternalPlayer();
      if (internalPlayer && typeof internalPlayer.stopVideo === "function") {
        internalPlayer.stopVideo();
      }
      // Delay slightly to ensure a smooth transition
      setTimeout(() => {
        const videoId = extractVideoId(trackUrl);
        if (videoId) {
          const internalPlayer = getInternalPlayer();
          if (
            internalPlayer &&
            typeof internalPlayer.loadVideoById === "function"
          ) {
            internalPlayer.loadVideoById(videoId);
            setPlayerMeta(trackUrl);
            setTrackInfo(trackDetails);
            setPlaying(true);
          } else {
            console.warn("Internal player is not ready to load the track.");
          }
        } else {
          console.warn("Invalid video ID for the track.");
        }
        setIsTransitioning(false);
      }, 100);
    },
    [extractVideoId, getInternalPlayer, setPlayerMeta, setTrackInfo]
  );

  // Prefetch next track URL (if not already in progress)
  const prefetchNextTrack = useCallback(async () => {
    if (isPrefetching || isTransitioning) return;
    setIsPrefetching(true);
    const queueId = getQueueId();
    if (!queueId) {
      console.warn("No queue available to prefetch next track");
      setIsPrefetching(false);
      return;
    }
    try {
      const nextTrackObj = await getNextAudioLink(queueId);
      if (!nextTrackObj) {
        console.warn("Backend returned null for next track.");
      } else if (nextTrackObj.audioLink && nextTrackObj.audioLink.url) {
        setNextTrackInfo(nextTrackObj);
      } else {
        console.warn("Received invalid track info from backend:", nextTrackObj);
      }
    } catch (error) {
      console.error("Error prefetching next track:", error);
    } finally {
      setIsPrefetching(false);
    }
  }, [getQueueId, isPrefetching, isTransitioning]);

  // Unified next-track handler with guard flag and prefetch check
  const playNextTrack = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Wait until any prefetch is finished
    while (isPrefetching) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    let nextUrlToPlay = nextTrackInfo?.audioLink?.url;
    let nextTrackDetails = nextTrackInfo
      ? { trackName: nextTrackInfo.trackName, imgSrc: nextTrackInfo.imgSrc }
      : null;

    // If pre-fetched info is not available, fetch it directly
    if (!nextUrlToPlay) {
      const queueId = getQueueId();
      if (!queueId) {
        console.warn("No queue available for next track.");
        setIsTransitioning(false);
        return;
      }
      try {
        const nextTrackObj = await getNextAudioLink(queueId);
        if (!nextTrackObj) {
          console.warn("Backend returned null for next track.");
          setIsTransitioning(false);
          return;
        }
        if (nextTrackObj.audioLink && nextTrackObj.audioLink.url) {
          nextUrlToPlay = nextTrackObj.audioLink.url;
          nextTrackDetails = {
            trackName: nextTrackObj.trackName,
            imgSrc: nextTrackObj.imgSrc,
          };
        } else {
          console.warn(
            "Received invalid track info from backend:",
            nextTrackObj
          );
          setIsTransitioning(false);
          return;
        }
      } catch (error) {
        console.error("Error fetching next track:", error);
        setIsTransitioning(false);
        return;
      }
    }

    if (nextUrlToPlay) {
      setNextTrackInfo(null);
      loadTrack(nextUrlToPlay, nextTrackDetails);
    } else {
      console.warn("No valid next track URL found.");
      setIsTransitioning(false);
    }
  }, [getQueueId, isPrefetching, isTransitioning, nextTrackInfo, loadTrack]);

  // Unified previous-track handler
  const playPreviousTrack = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const queueId = getQueueId();
    if (!queueId) {
      console.warn("No queue available for previous track.");
      setIsTransitioning(false);
      return;
    }

    try {
      const previousTrackObj = await getPreviousAudioLink(queueId);
      if (!previousTrackObj) {
        console.warn("Backend returned null for previous track.");
        setIsTransitioning(false);
        return;
      }
      const previousUrlToPlay = previousTrackObj.audioLink?.url;
      const previousTrackDetails = {
        trackName: previousTrackObj.trackName,
        imgSrc: previousTrackObj.imgSrc,
      };

      if (previousUrlToPlay) {
        loadTrack(previousUrlToPlay, previousTrackDetails);
      } else {
        console.warn("No valid previous track URL found.");
        setIsTransitioning(false);
      }
    } catch (error) {
      console.error("Error fetching previous track:", error);
      setIsTransitioning(false);
    }
  }, [getQueueId, isTransitioning, loadTrack]);

  // Handler for the Next Track button
  const handleNextTrackButton = useCallback(async () => {
    await playNextTrack();
  }, [playNextTrack]);

  // Handler for the Previous Track button
  const handlePreviousTrackButton = useCallback(async () => {
    // If a significant part of the track has been played, restart the current track instead.
    if (progress > 0.025 || duration < 5) {
      setProgress(0);
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(0, "seconds");
      }
      return;
    }
    await playPreviousTrack();
  }, [progress, duration, playPreviousTrack]);

  // Toggle play/pause functionality
  const togglePlayPause = useCallback(() => {
    if (!url) return;
    setPlaying((prev) => !prev);
    const internalPlayer = getInternalPlayer();
    if (internalPlayer) {
      if (playing && typeof internalPlayer.pauseVideo === "function") {
        internalPlayer.pauseVideo();
      } else if (!playing && typeof internalPlayer.playVideo === "function") {
        internalPlayer.playVideo();
      }
    }
  }, [playing, url, getInternalPlayer]);

  // Volume and seek handlers
  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    if (!isNaN(newVolume)) {
      setVolume(newVolume);
    }
  }, []);

  const handleSeekChange = useCallback(
    (e) => {
      const newProgress = parseFloat(e.target.value);
      if (!isNaN(newProgress) && duration > 0) {
        setProgress(newProgress);
        if (
          playerRef.current &&
          typeof playerRef.current.seekTo === "function"
        ) {
          playerRef.current.seekTo(newProgress * duration, "seconds");
        }
      }
    },
    [duration]
  );

  // Throttled progress update (update at most every 150ms)
  const throttledSetProgress = useThrottle((played) => {
    setProgress(played);
  }, 150);

  const handleProgress = useCallback(
    (progressData) => {
      if (duration > 0 && !isSeeking && progressData?.played !== undefined) {
        throttledSetProgress(progressData.played);
      }
      if (
        progressData?.played >= 0.85 &&
        !nextTrackInfo &&
        !isPrefetching &&
        !isTransitioning
      ) {
        prefetchNextTrack();
      }
    },
    [
      duration,
      isSeeking,
      nextTrackInfo,
      isPrefetching,
      isTransitioning,
      prefetchNextTrack,
      throttledSetProgress,
    ]
  );

  const handleDuration = useCallback((dur) => {
    if (!isNaN(dur)) {
      setDuration(dur);
    }
  }, []);

  // Buffering handlers
  const handleBuffer = useCallback(() => {
    setIsBuffering(true);
  }, []);
  const handleBufferEnd = useCallback(() => {
    setIsBuffering(false);
  }, []);

  // Error handler: display error and skip to next track
  const handlePlayerError = useCallback(
    async (error) => {
      console.error("Error playing video:", error);
      setErrorMessage("Error playing this track. Skipping to next...");
      setProgress(0);
      setDuration(0);
      setSkipNextEnded(true);
      if (!isTransitioning) {
        await playNextTrack();
      }
    },
    [isTransitioning, playNextTrack]
  );

  // onEnded: transition to the next track when finished
  const handleEnded = useCallback(async () => {
    if (skipNextEnded) {
      setSkipNextEnded(false);
      return;
    }
    if (!isTransitioning) {
      setProgress(1);
      setPlaying(false);
      await playNextTrack();
    }
  }, [isTransitioning, playNextTrack, skipNextEnded]);

  // Utility: Check if an input element is focused
  const isInputFocused = useCallback(
    () => ["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName),
    []
  );

  // Global key event handlers
  useEffect(() => {
    const handleSpacebar = (e) => {
      if ((e.code === "Space" || e.key === " ") && !isInputFocused()) {
        e.preventDefault();
        if (url) togglePlayPause();
      }
    };
    const handleArrowKeys = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
        return;
      if (!url) return;
      try {
        const internalPlayer = getInternalPlayer();
        const currentTime =
          internalPlayer && typeof internalPlayer.getCurrentTime === "function"
            ? internalPlayer.getCurrentTime()
            : 0;
        if (e.key === "ArrowLeft") {
          const newTime = Math.max(currentTime - 5, 0);
          if (
            playerRef.current &&
            typeof playerRef.current.seekTo === "function"
          ) {
            playerRef.current.seekTo(newTime, "seconds");
          }
          if (duration > 0) setProgress(newTime / duration);
        } else if (e.key === "ArrowRight") {
          const newTime = Math.min(currentTime + 5, duration);
          if (
            playerRef.current &&
            typeof playerRef.current.seekTo === "function"
          ) {
            playerRef.current.seekTo(newTime, "seconds");
          }
          if (duration > 0) setProgress(newTime / duration);
        }
      } catch (error) {
        console.error("Error handling arrow keys:", error);
      }
    };
    window.addEventListener("keydown", handleSpacebar);
    window.addEventListener("keydown", handleArrowKeys);
    return () => {
      window.removeEventListener("keydown", handleSpacebar);
      window.removeEventListener("keydown", handleArrowKeys);
    };
  }, [isInputFocused, togglePlayPause, url, duration, getInternalPlayer]);

  // Volume wheel control
  useEffect(() => {
    const handleVolumeScroll = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      const newVolume = Math.min(1, Math.max(0, volume + delta));
      setVolume(newVolume);
    };
    const slider = volumeSliderRef.current;
    if (slider) {
      slider.addEventListener("wheel", handleVolumeScroll);
    }
    return () =>
      slider && slider.removeEventListener("wheel", handleVolumeScroll);
  }, [volume]);

  // Memoized volume icon (no extra re-render cycle)
  const volumeIcon = useMemo(() => {
    if (volume === 0) return "fa-volume-xmark";
    return volume <= 0.5 ? "fa-volume-low" : "fa-volume-high";
  }, [volume]);

  // Reset player state when URL changes
  useEffect(() => {
    if (url) {
      setPlaying(true);
      setProgress(0);
      setDuration(0);
      setNextTrackInfo(null);
      setErrorMessage("");
      if (playerRef.current && typeof playerRef.current.seekTo === "function") {
        playerRef.current.seekTo(0, "seconds");
      }
    } else {
      setPlaying(false);
    }
  }, [url]);

  // Update player source without reinitializing ReactPlayer
  useEffect(() => {
    if (url && getInternalPlayer()) {
      const videoId = extractVideoId(url);
      if (videoId) {
        setTimeout(() => {
          const internalPlayer = getInternalPlayer();
          if (
            internalPlayer &&
            typeof internalPlayer.loadVideoById === "function"
          ) {
            internalPlayer.loadVideoById(videoId);
          } else {
            console.warn(
              "Unable to update player source. Internal player not available."
            );
          }
        }, 1000);
      }
    }
  }, [url, extractVideoId, getInternalPlayer]);

  return (
    <>
      <div className="player">
        <h2 className="track-heading">Now Playing</h2>
        <Link to="/track" className="track-info">
          <div className="thumbnail">
            <img
              src={trackInfo?.imgSrc || TrackLogo}
              alt="Track Logo"
              aria-label="Track Logo"
            />
          </div>
          <span className="track-name">
            {trackInfo?.trackName || "- - - - - - - - - - - -"}
          </span>
        </Link>

        <button
          className="other-btn"
          onClick={() => console.log("Shuffle button clicked")}
          aria-label="Shuffle"
        >
          <i className="fa-solid fa-shuffle"></i>
        </button>
        <button
          className="backward-btn"
          onClick={handlePreviousTrackButton}
          aria-label="Previous Track"
        >
          <i className="fa-solid fa-backward-step"></i>
        </button>

        {isBuffering ? (
          <div
            className="play-pause-btn buffering-spinner"
            aria-label="Buffering"
          >
            <span className="spinner"></span>
          </div>
        ) : (
          <button
            className="play-pause-btn"
            onClick={togglePlayPause}
            disabled={!url}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? (
              <i className="fa-solid fa-pause icon"></i>
            ) : (
              <i className="fa-solid fa-play icon"></i>
            )}
          </button>
        )}

        <button
          className="backward-btn"
          onClick={handleNextTrackButton}
          aria-label="Next Track"
        >
          <i className="fa-solid fa-forward-step"></i>
        </button>
        <button
          className="other-btn"
          onClick={() => console.log("Loop button clicked")}
          aria-label="Loop"
        >
          <i className="fa-solid fa-repeat"></i>
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={isNaN(progress) ? 0 : progress}
          onChange={handleSeekChange}
          onMouseDown={() => setIsSeeking(true)}
          onMouseUp={() => setIsSeeking(false)}
          disabled={!url}
          aria-label="Seek"
        />
        <span className="duration-board">
          {prettyMilliseconds(Math.round(progress * duration) * 1000, {
            colonNotation: true,
            secondsDecimalDigits: 0,
          })}{" "}
          |{" "}
          {prettyMilliseconds(duration * 1000, {
            colonNotation: true,
            secondsDecimalDigits: 0,
          })}
        </span>
        <div
          className="volume-icon-container"
          onClick={() => setVolume(volume === 0 ? 0.8 : 0)}
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
            <video
              autoPlay
              loop
              muted
              src={musicWave}
              aria-label="Music Wave"
            />
          )}
        </div>
        {errorMessage && (
          <div className="error-message" role="alert">
            {errorMessage}
          </div>
        )}
      </div>
      <Suspense fallback={<div>Loading...</div>}>
        {url && (
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing}
            volume={volume}
            muted={false}
            width="0px"
            height="0px"
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
            onReady={() => setIsPlayerReady(true)}
            onDuration={handleDuration}
            onEnded={handleEnded}
            onError={handlePlayerError}
            onProgress={handleProgress}
            onBuffer={handleBuffer}
            onBufferEnd={handleBufferEnd}
          />
        )}
      </Suspense>
    </>
  );
};

export default Player;
