// src/context/PlayerProvider.jsx
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { getNextAudioLink, getPreviousAudioLink } from '../apis/apiFunctions';
import { getLikedSongs } from "../apis/apiFunctions"; // Import thi
// Throttle helper
function useThrottle(callback, delay) {
  const lastCallRef = useRef(0);
  return useCallback((...args) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]);
}

const PlayerContext = createContext();

export const PlayerProvider = ({
  children,
  initialUrl = "",
  initialTrackInfo = {},
  initialIsAuth = false,
  initialIsSpotifyConnected = false,
}) => {
  // — Core playback state
  const [url, setUrl] = useState(initialUrl);
  const [trackInfo, setTrackInfo] = useState(initialTrackInfo);
  const [volume, setVolume] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuth, setIsAuth] = useState(initialIsAuth);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(initialIsSpotifyConnected);

  // — Prefetch & transition
  const [nextTrackInfo, setNextTrackInfo] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skipNextEnded, setSkipNextEnded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

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
      setLikedSongs(prev => prev.filter(id => id !== trackId));
    } else {
      setLikedSongs(prev => [...prev, trackId]);
    }
  };


  // — Helpers
  const extractVideoId = useCallback((videoUrl) => {
    if (!videoUrl) return null;
    try {
      const urlObj = new URL(videoUrl);
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
      if (/youtube\.com/.test(urlObj.hostname)) {
        const v = urlObj.searchParams.get("v") || urlObj.searchParams.get("vi");
        if (v && /^[\w-]{11}$/.test(v)) return v;
        for (let seg of urlObj.pathname.split("/")) {
          if (/^[\w-]{11}$/.test(seg)) return seg;
        }
        if (urlObj.hash) {
          for (let seg of urlObj.hash.slice(1).split("/")) {
            if (/^[\w-]{11}$/.test(seg)) return seg;
          }
        }
      }
    } catch (e) {
      console.error("extractVideoId error", e);
    }
    return null;
  }, []);

  const getQueueId = useCallback(() => {
    try {
      return window.sessionStorage.getItem("queueId");
    } catch {
      return null;
    }
  }, []);

  const getInternalPlayer = useCallback(() => {
    return playerRef.current?.getInternalPlayer?.() || null;
  }, []);

  // — Track loading & navigation
  const loadTrack = useCallback(
    (trackUrl, trackDetails) => {
      const internal = getInternalPlayer();
      
      // Stop current track and reset state
      internal?.stopVideo?.();
      setPlaying(false);
      setProgress(0);
      setDuration(0);
      setErrorMessage("");
      
      setTimeout(() => {
        const vid = extractVideoId(trackUrl);
        const ip = getInternalPlayer();
        if (vid && ip?.loadVideoById) {
          // Load and play the new video
          ip.loadVideoById(vid);
          setUrl(trackUrl);
          setTrackInfo(trackDetails);
          
          // Set playing to true after a short delay to ensure video loads
          setTimeout(() => {
            setPlaying(true);
          }, 200);
        }
        setIsTransitioning(false);
      }, 100);
    },
    [extractVideoId, getInternalPlayer]
  );

  const prefetchNextTrack = useCallback(async () => {
    if (isPrefetching || isTransitioning) return;
    setIsPrefetching(true);
    const q = getQueueId();
    if (!q) {
      setIsPrefetching(false);
      return;
    }
    try {
      const nxt = await getNextAudioLink(q);
      if (nxt?.audioLink?.url) {
        setNextTrackInfo(nxt);
      }
    } catch (e) {
      console.error("prefetchNextTrack error", e);
    }
    setIsPrefetching(false);
  }, [getQueueId, isPrefetching, isTransitioning]);

  const playNextTrack = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    while (isPrefetching) {
      await new Promise((r) => setTimeout(r, 50));
    }

    let nextUrl = nextTrackInfo?.audioLink?.url;
  let details = nextTrackInfo
      ? { 
          id: nextTrackInfo.id, // <--- ADD THIS LINE
          trackName: nextTrackInfo.trackName, 
          imgSrc: nextTrackInfo.imgSrc,
          artistNames: nextTrackInfo.artistNames || ["Unknown Artist"]
        }
      : null;

    if (!nextUrl) {
      const q = getQueueId();
      if (!q) return setIsTransitioning(false);

      try {
        const nxt = await getNextAudioLink(q);
        if (nxt?.audioLink?.url) {
          nextUrl = nxt.audioLink.url;
          details = {
            id: nxt.id, // <--- ADD THIS LINE
            trackName: nxt.trackName,
            imgSrc: nxt.imgSrc,
            artistNames: nxt.artistNames || ["Unknown Artist"],
          };
        }} catch (e) {
        console.error("playNextTrack fetch error", e);
        setIsTransitioning(false);
        return;
      }
    }

    if (nextUrl) {
      setNextTrackInfo(null);
      loadTrack(nextUrl, details);
    } else {
      setIsTransitioning(false);
    }
  }, [getQueueId, isPrefetching, isTransitioning, nextTrackInfo, loadTrack]);

  const playPreviousTrack = useCallback(async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    const q = getQueueId();
    if (!q) return setIsTransitioning(false);

    try {
     const prev = await getPreviousAudioLink(q);
      const urlToPlay = prev?.audioLink?.url;
      const details = {
        id: prev.id, // <--- ADD THIS LINE
        trackName: prev.trackName,
        imgSrc: prev.imgSrc,
        artistNames: prev.artistNames || ["Unknown Artist"],
      };
      if (urlToPlay) {
        loadTrack(urlToPlay, details);
      } else {
        setIsTransitioning(false);
      }
    } catch (e) {
      console.error("playPreviousTrack error", e);
      setIsTransitioning(false);
    }
  }, [getQueueId, isTransitioning, loadTrack]);

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
      if (duration > 0 && !isSeeking && pd.played !== undefined) {
        throttledSetProgress(pd.played);
      }
      if (
        pd.played >= 0.85 &&
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
      alert("Error playing this track due to copyright. Skipping.");
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
    if (initialTrackInfo) setTrackInfo(initialTrackInfo);
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
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (url) {
            togglePlayPause();
          }
          break;
        
        case 'ArrowLeft':
          e.preventDefault();
          if (url && duration > 0) {
            const newTime = Math.max(0, (progress * duration) - 5);
            const newProgress = newTime / duration;
            setProgress(newProgress);
            playerRef.current?.seekTo(newTime, "seconds");
          }
          break;
        
        case 'ArrowRight':
          e.preventDefault();
          if (url && duration > 0) {
            const newTime = Math.min(duration, (progress * duration) + 5);
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
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [url, duration, progress, togglePlayPause]);

  // Volume icon
  const volumeIcon =
    volume === 0
      ? "fa-volume-xmark"
      : volume <= 0.5
      ? "fa-volume-low"
      : "fa-volume-high";

  const contextValue = {
    // state & refs
    url,
    setUrl,
    trackInfo,
    setTrackInfo,
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

    likedSongs,         // Export state
        setLikedSongs,      // Export setter
        fetchLikedSongs,    // Export fetcher
        toggleLikeLocal
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
};

export const useSharedPlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error("useSharedPlayer must be used within a PlayerProvider");
  }
  return context;
};