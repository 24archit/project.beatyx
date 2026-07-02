// src/context/PlayerProvider.jsx
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import ReactPlayer from "react-player/youtube";
import { getAudioLink } from "./playerService";
import { getLikedSongs } from "@/services/userService";
// Throttle helper
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

import { PlayerContext } from "./playerContextDefinition";

export const PlayerProvider = ({
  children,
  initialUrl = "",
  initialTrackInfo = {},
  initialIsAuth = false,
  initialIsSpotifyConnected = false,
}) => {
  // — Core playback state
  const [url, setUrl] = useState(() => {
    try {
      const stored = window.localStorage.getItem("beatyx_track_url");
      return stored && stored !== "undefined" ? stored : initialUrl;
    } catch {
      return initialUrl;
    }
  });

  const [trackInfo, setTrackInfo] = useState(() => {
    let parsed = null;
    try {
      const stored = window.localStorage.getItem("beatyx_track_info");
      parsed = stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch {
      // Ignore initial parse error
    }

    if (!parsed || Object.keys(parsed).length === 0) {
      try {
        const storedQueue = window.localStorage.getItem("beatyx_queue");
        const storedIndex = window.localStorage.getItem("beatyx_queue_index");
        if (storedQueue && storedIndex !== null && storedIndex !== "undefined") {
          const parsedQueue = JSON.parse(storedQueue);
          const parsedIndex = parseInt(storedIndex, 10);
          if (parsedQueue[parsedIndex]) {
            parsed = parsedQueue[parsedIndex];
          }
        }
      } catch {
        // Ignore fallback parse error
      }
    }
    return parsed || initialTrackInfo;
  });
  const [volume, setVolume] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);

  // Load recently played tracks from localStorage
  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const stored = localStorage.getItem("recentlyPlayed");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [isAuth, setIsAuth] = useState(initialIsAuth);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(initialIsSpotifyConnected);

  // — Queue state (Local Persisted)
  const [queue, setQueue] = useState(() => {
    try {
      const stored = window.localStorage.getItem("beatyx_queue");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [currentTrackIndex, setCurrentTrackIndex] = useState(() => {
    try {
      const stored = window.localStorage.getItem("beatyx_queue_index");
      return stored ? parseInt(stored, 10) : -1;
    } catch {
      return -1;
    }
  });

  // Sync queue state to localStorage
  useEffect(() => {
    window.localStorage.setItem("beatyx_queue", JSON.stringify(queue));
  }, [queue]);

  useEffect(() => {
    window.localStorage.setItem("beatyx_queue_index", currentTrackIndex.toString());
  }, [currentTrackIndex]);

  useEffect(() => {
    if (url) {
      window.localStorage.setItem("beatyx_track_url", url);
    }
  }, [url]);

  useEffect(() => {
    if (trackInfo && Object.keys(trackInfo).length > 0) {
      window.localStorage.setItem("beatyx_track_info", JSON.stringify(trackInfo));
    }
  }, [trackInfo]);

  // — Prefetch & transition
  const [nextTrackInfo, setNextTrackInfo] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadingTrackId, setLoadingTrackId] = useState(null);
  const [skipNextEnded, setSkipNextEnded] = useState(false);

  const prefetchedForUrlRef = useRef(null);
  const consecutiveErrorsRef = useRef(0);

  // — References
  const playerRef = useRef(null);
  const volumeSliderRef = useRef(null);

  const [likedSongs, setLikedSongs] = useState([]);
  const fetchLikedSongs = async () => {
    const data = await getLikedSongs();
    if (data && data.likedSongs) {
      setLikedSongs(data.likedSongs);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
  }, []); // Runs once on app load

  const toggleLikeLocal = (trackId) => {
    if (likedSongs.includes(trackId)) {
      setLikedSongs((prev) => prev.filter((id) => id !== trackId));
    } else {
      setLikedSongs((prev) => [...prev, trackId]);
    }
  };

  const getInternalPlayer = useCallback(() => {
    return playerRef.current?.getInternalPlayer?.() || null;
  }, []);

  // — Track loading & navigation
  const loadTrack = useCallback((trackUrl, trackDetails) => {
    // Just update React state, let react-player handle the media transitions internally.
    // Manually calling internal player methods + setTimeout loses the mobile user-gesture token.
    setUrl(trackUrl);
    setTrackInfo(trackDetails);
    setPlaying(true);
    setProgress(0);
    setDuration(0);
    setErrorMessage("");
    setIsBuffering(true);
    setIsTransitioning(false);
  }, []);

  const prefetchNextTrack = useCallback(async () => {
    if (isPrefetching || isTransitioning) return;
    const nextTrack = queue[currentTrackIndex + 1];
    if (!nextTrack) return;

    setIsPrefetching(true);
    prefetchedForUrlRef.current = url;

    try {
      const data = await getAudioLink(nextTrack.id);
      if (data?.url) {
        setNextTrackInfo({ id: nextTrack.id, audioLink: { url: data.url } });
      }
    } catch (e) {
      console.error("prefetchNextTrack error", e);
    }
    setIsPrefetching(false);
  }, [queue, currentTrackIndex, isPrefetching, isTransitioning, url]);

  const playNextTrack = useCallback(async () => {
    if (isTransitioning || queue.length === 0) return;
    setIsTransitioning(true);

    while (isPrefetching) {
      await new Promise((r) => setTimeout(r, 50));
    }

    let nextIndex = currentTrackIndex + 1;
    if (nextIndex >= queue.length) nextIndex = 0; // Loop to start

    let nextTrack = queue[nextIndex];
    let attempts = 0;
    const MAX_ATTEMPTS = queue.length; // Don't infinite loop forever if all tracks are broken

    let nextUrl = nextTrackInfo?.audioLink?.url;
    // If prefetched track doesn't match the expected next track, discard it
    if (nextTrackInfo?.id !== nextTrack?.id) {
      nextUrl = null;
    }

    while (!nextUrl && attempts < MAX_ATTEMPTS) {
      try {
        setLoadingTrackId(nextTrack.id);
        const data = await getAudioLink(nextTrack.id);
        if (data?.url) {
          nextUrl = data.url;
          break;
        }
      } catch (e) {
        console.error(`playNextTrack fetch error (attempt ${attempts + 1})`, e);
      }
      // Skip to the next track if fetch fails
      attempts++;
      if (attempts >= MAX_ATTEMPTS) break;

      nextIndex++;
      if (nextIndex >= queue.length) nextIndex = 0; // Loop to start
      nextTrack = queue[nextIndex];
    }

    if (nextUrl && nextTrack) {
      setNextTrackInfo(null);
      setCurrentTrackIndex(nextIndex);
      loadTrack(nextUrl, nextTrack);
    } else {
      setIsTransitioning(false);
      setPlaying(false);
      setErrorMessage("No playable tracks found in the queue.");
    }
    setLoadingTrackId(null);
  }, [queue, currentTrackIndex, isPrefetching, isTransitioning, nextTrackInfo, loadTrack]);

  const playPreviousTrack = useCallback(async () => {
    if (isTransitioning || queue.length === 0) return;
    setIsTransitioning(true);

    let prevIndex = currentTrackIndex - 1;
    if (prevIndex < 0) prevIndex = queue.length - 1; // Loop to end
    let prevTrack = queue[prevIndex];

    let prevUrl = null;
    let attempts = 0;
    const MAX_ATTEMPTS = queue.length;

    while (!prevUrl && attempts < MAX_ATTEMPTS) {
      try {
        setLoadingTrackId(prevTrack.id);
        const data = await getAudioLink(prevTrack.id);
        if (data?.url) {
          prevUrl = data.url;
          break;
        }
      } catch (e) {
        console.error("playPreviousTrack error", e);
      }
      attempts++;
      if (attempts >= MAX_ATTEMPTS) break;

      prevIndex--;
      if (prevIndex < 0) prevIndex = queue.length - 1;
      prevTrack = queue[prevIndex];
    }

    if (prevUrl && prevTrack) {
      setCurrentTrackIndex(prevIndex);
      loadTrack(prevUrl, prevTrack);
    } else {
      setIsTransitioning(false);
      setErrorMessage("No playable tracks found in the queue.");
    }
    setLoadingTrackId(null);
  }, [queue, currentTrackIndex, isTransitioning, loadTrack]);

  const removeFromQueue = useCallback((indexToRemove) => {
    setQueue((prevQueue) => {
      const newQueue = [...prevQueue];
      newQueue.splice(indexToRemove, 1);
      return newQueue;
    });

    setCurrentTrackIndex((prevIndex) => {
      if (indexToRemove < prevIndex) {
        return prevIndex - 1; // Shift back if removed track was before current
      }
      return prevIndex;
    });
  }, []);

  const playQueue = useCallback(
    async (newQueue, startIndex = 0) => {
      const track = newQueue[startIndex];
      if (!track) return;

      try {
        setIsTransitioning(true);
        setErrorMessage("");
        setLoadingTrackId(track.id);
        const data = await getAudioLink(track.id);
        if (data?.url) {
          setQueue(newQueue);
          setCurrentTrackIndex(startIndex);
          loadTrack(data.url, track);
        } else {
          throw new Error("No URL returned");
        }
      } catch (error) {
        console.error("playQueue error", error);
        setErrorMessage("Error playing this track.");
        setTimeout(() => setErrorMessage(""), 3000);
        if (newQueue === queue) {
          removeFromQueue(startIndex);
        }
      } finally {
        setIsTransitioning(false);
        setLoadingTrackId(null);
      }
    },
    [loadTrack, queue, removeFromQueue]
  );

  const addNextToQueue = useCallback(
    (track) => {
      setQueue((prevQueue) => {
        const newQueue = [...prevQueue];
        // Insert right after current track
        const insertAt = currentTrackIndex >= 0 ? currentTrackIndex + 1 : 0;
        newQueue.splice(insertAt, 0, track);
        return newQueue;
      });
      // If the queue was empty, play it immediately
      if (queue.length === 0) {
        playQueue([track], 0);
      }
    },
    [currentTrackIndex, queue.length, playQueue]
  );

  // — Handlers
  const handleNext = useCallback(
    async (e) => {
      await playNextTrack();
      e?.target?.blur();
    },
    [playNextTrack]
  );

  const handlePrev = useCallback(
    async (e) => {
      if (progress > 0.025 || duration < 5) {
        setProgress(0);
        playerRef.current?.seekTo(0, "seconds");
        return;
      }
      await playPreviousTrack();
      e?.target?.blur();
    },
    [progress, duration, playPreviousTrack]
  );

  const togglePlayPause = useCallback(
    (e) => {
      if (!url) return;

      const newPlayingState = !playing;
      setPlaying(newPlayingState);

      const ip = getInternalPlayer();
      if (ip) {
        if (newPlayingState) {
          ip.playVideo?.();
        } else {
          ip.pauseVideo?.();
        }
      }
      e?.target?.blur();
    },
    [playing, url, getInternalPlayer]
  );

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setVolume(v);
    e?.target?.blur();
  }, []);

  const handleSeekChange = useCallback(
    (e) => {
      const p = parseFloat(e.target.value);
      if (!isNaN(p) && duration > 0) {
        setProgress(p);
        playerRef.current?.seekTo(p * duration, "seconds");
      }
      e?.target?.blur();
    },
    [duration]
  );

  const throttledSetProgress = useThrottle((p) => setProgress(p), 150);

  const handleProgress = useCallback(
    (pd) => {
      if (duration > 0 && pd.played !== undefined) {
        throttledSetProgress(pd.played);
      }
      if (
        pd.played >= 0.85 &&
        !nextTrackInfo &&
        !isPrefetching &&
        !isTransitioning &&
        prefetchedForUrlRef.current !== url
      ) {
        prefetchNextTrack();
      }
    },
    [
      duration,
      nextTrackInfo,
      isPrefetching,
      isTransitioning,
      prefetchNextTrack,
      throttledSetProgress,
      url,
    ]
  );

  const handleDuration = useCallback((d) => {
    if (!isNaN(d)) setDuration(d);
  }, []);

  const handleBuffer = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleBufferEnd = useCallback(() => {
    setIsBuffering(false);
  }, []);

  // Add handlers for YouTube player state changes
  const handlePlay = useCallback(() => {
    setPlaying(true);
    setIsBuffering(false);
    consecutiveErrorsRef.current = 0; // Reset error circuit breaker on successful play
  }, []);

  const handlePause = useCallback(() => {
    setPlaying(false);
  }, []);

  const handleReady = useCallback(() => {
    setIsPlayerReady(true);
  }, []);

  const handleError = useCallback(
    async (err) => {
      console.error("player error", err);
      setErrorMessage("Error playing this track. Skipping...");
      setPlaying(false);
      setProgress(0);
      setDuration(0);
      setSkipNextEnded(true);

      consecutiveErrorsRef.current += 1;
      if (consecutiveErrorsRef.current > 5) {
        // Only alert if we've tried multiple times and keep failing
        console.warn("Too many playback errors. Playback paused.");
        return; // Circuit breaker: don't automatically skip anymore
      }

      // Automatically skip to the next track on error for a seamless experience
      if (!isTransitioning) await playNextTrack();
    },
    [isTransitioning, playNextTrack]
  );

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

  // — Effects
  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (initialTrackInfo && Object.keys(initialTrackInfo).length > 0) {
      setTrackInfo(initialTrackInfo);
    }
  }, [initialTrackInfo]);

  // Sync auth states when parent changes
  useEffect(() => {
    setIsAuth(initialIsAuth);
  }, [initialIsAuth]);

  useEffect(() => {
    setIsSpotifyConnected(initialIsSpotifyConnected);
  }, [initialIsSpotifyConnected]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if user is typing in an input field
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          if (url) {
            togglePlayPause();
          }
          break;

        case "ArrowLeft":
          e.preventDefault();
          if (url && duration > 0) {
            const newTime = Math.max(0, progress * duration - 5);
            const newProgress = newTime / duration;
            setProgress(newProgress);
            playerRef.current?.seekTo(newTime, "seconds");
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          if (url && duration > 0) {
            const newTime = Math.min(duration, progress * duration + 5);
            const newProgress = newTime / duration;
            setProgress(newProgress);
            playerRef.current?.seekTo(newTime, "seconds");
          }
          break;

        default:
          break;
      }
    };

    // Add event listener
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [url, duration, progress, togglePlayPause]);

  // Volume icon
  const volumeIcon =
    volume === 0 ? "fa-volume-xmark" : volume <= 0.5 ? "fa-volume-low" : "fa-volume-high";

  const contextValue = {
    // state & refs
    url,
    setUrl,
    trackInfo,
    setTrackInfo,
    queue,
    currentTrackIndex,
    volume,
    setVolume,
    playing,
    setPlaying,
    progress,
    duration,
    isPlayerReady,
    setIsPlayerReady,
    isBuffering,
    errorMessage,
    loadingTrackId,
    isAuth,
    setIsAuth,
    isSpotifyConnected,
    setIsSpotifyConnected,
    playerRef,
    volumeSliderRef,

    // handlers & icons
    volumeIcon,
    handleNext,
    handlePrev,
    togglePlayPause,
    handleSeekChange,
    handleVolumeChange,
    handleProgress,
    handleDuration,
    handleBuffer,
    handleBufferEnd,
    handleError,
    handleEnded,
    handlePlay,
    handlePause,
    handleReady,
    playQueue,
    removeFromQueue,
    addNextToQueue,

    likedSongs, // Export state
    setLikedSongs, // Export setter
    fetchLikedSongs, // Export fetcher
    toggleLikeLocal,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          width: "10px",
          height: "10px",
          zIndex: -10,
          pointerEvents: "none",
          overflow: "hidden",
          opacity: 0.01,
        }}
      >
        <Suspense fallback={null}>
          {url && (
            <ReactPlayer
              ref={playerRef}
              url={url}
              playing={playing}
              volume={volume}
              width="100%"
              height="100%"
              pip={true}
              playsinline={true}
              config={{
                youtube: {
                  playerVars: {
                    autoplay: 0,
                    controls: 0,
                    modestbranding: 1,
                    origin: window.location.origin,
                    disableRemotePlayback: 1,
                    playsinline: 1,
                    background: 1,
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
    </PlayerContext.Provider>
  );
};
