// src/hooks/usePlayerController.js
import { useState, useRef, useEffect, useCallback } from 'react';
import { getNextAudioLink, getPreviousAudioLink } from '../apis/apiFunctions';

// Throttle helper: ensures callback runs at most once per `delay` ms
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

export function usePlayerController(initialUrl = '', initialTrackInfo = {}) {
  // — Core playback state
  const [url, setUrl] = useState(initialUrl);
  const [trackInfo, setTrackInfo] = useState(initialTrackInfo);
  const [volume, setVolume] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // — Prefetch & transition
  const [nextTrackInfo, setNextTrackInfo] = useState(null);
  const [isPrefetching, setIsPrefetching] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [skipNextEnded, setSkipNextEnded] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);

  // — References
  const playerRef = useRef(null);
  const volumeSliderRef = useRef(null);

  // — Helpers
  const extractVideoId = useCallback((videoUrl) => {
    if (!videoUrl) return null;
    try {
      const urlObj = new URL(videoUrl);
      if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.slice(1);
      }
      if (/youtube\.com/.test(urlObj.hostname)) {
        const v = urlObj.searchParams.get('v') || urlObj.searchParams.get('vi');
        if (v && /^[\w-]{11}$/.test(v)) return v;
        for (let seg of urlObj.pathname.split('/')) {
          if (/^[\w-]{11}$/.test(seg)) return seg;
        }
        if (urlObj.hash) {
          for (let seg of urlObj.hash.slice(1).split('/')) {
            if (/^[\w-]{11}$/.test(seg)) return seg;
          }
        }
      }
    } catch (e) {
      console.error('extractVideoId error', e);
    }
    return null;
  }, []);

  const getQueueId = useCallback(() => {
    try {
      return window.sessionStorage.getItem('queueId');
    } catch {
      return null;
    }
  }, []);

  const getInternalPlayer = useCallback(() => {
    return playerRef.current?.getInternalPlayer?.() || null;
  }, []);

  // — Track loading & navigation
  const loadTrack = useCallback((trackUrl, trackDetails) => {
    const internal = getInternalPlayer();
    internal?.stopVideo?.();
    setTimeout(() => {
      const vid = extractVideoId(trackUrl);
      const ip = getInternalPlayer();
      if (vid && ip?.loadVideoById) {
        ip.loadVideoById(vid);
        setUrl(trackUrl);
        setTrackInfo(trackDetails);
        setPlaying(true);
      }
      setIsTransitioning(false);
    }, 100);
  }, [extractVideoId, getInternalPlayer]);

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
      console.error('prefetchNextTrack error', e);
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
      ? { trackName: nextTrackInfo.trackName, imgSrc: nextTrackInfo.imgSrc }
      : null;

    if (!nextUrl) {
      const q = getQueueId();
      if (!q) return setIsTransitioning(false);

      try {
        const nxt = await getNextAudioLink(q);
        if (nxt?.audioLink?.url) {
          nextUrl = nxt.audioLink.url;
          details = { trackName: nxt.trackName, imgSrc: nxt.imgSrc };
        }
      } catch (e) {
        console.error('playNextTrack fetch error', e);
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
      const details = { trackName: prev.trackName, imgSrc: prev.imgSrc };
      if (urlToPlay) {
        loadTrack(urlToPlay, details);
      }
    } catch (e) {
      console.error('playPreviousTrack error', e);
    }
  }, [getQueueId, isTransitioning, loadTrack]);

  // — Handlers
  const handleNext = useCallback(async (e) => {
    await playNextTrack();
    e.target.blur();
  }, [playNextTrack]);

  const handlePrev = useCallback(async (e) => {
    if (progress > 0.025 || duration < 5) {
      setProgress(0);
      playerRef.current?.seekTo(0, 'seconds');
      return;
    }
    await playPreviousTrack();
    e.target.blur();
  }, [progress, duration, playPreviousTrack]);

  const togglePlayPause = useCallback((e) => {
    if (!url) return;
    setPlaying((p) => !p);
    const ip = getInternalPlayer();
    if (ip) {
      playing ? ip.pauseVideo?.() : ip.playVideo?.();
    }
    e.target.blur();
  }, [playing, url, getInternalPlayer]);

  const handleVolumeChange = useCallback((e) => {
    const v = parseFloat(e.target.value);
    if (!isNaN(v)) setVolume(v);
    e.target.blur();
  }, []);

  const handleSeekChange = useCallback((e) => {
    const p = parseFloat(e.target.value);
    if (!isNaN(p) && duration > 0) {
      setProgress(p);
      playerRef.current?.seekTo(p * duration, 'seconds');
    }
    e.target.blur();
  }, [duration]);

  const throttledSetProgress = useThrottle((p) => setProgress(p), 150);

  const handleProgress = useCallback((pd) => {
    if (duration > 0 && !isSeeking && pd.played !== undefined) {
      throttledSetProgress(pd.played);
    }
    if (pd.played >= 0.85 && !nextTrackInfo && !isPrefetching && !isTransitioning) {
      prefetchNextTrack();
    }
  }, [duration, isSeeking, nextTrackInfo, isPrefetching, isTransitioning, prefetchNextTrack, throttledSetProgress]);

  const handleDuration = useCallback((d) => {
    if (!isNaN(d)) setDuration(d);
  }, []);

  const handleBuffer = useCallback(() => {
    setIsBuffering(true);
  }, []);

  const handleBufferEnd = useCallback(() => {
    setIsBuffering(false);
  }, []);

  const handleError = useCallback(async (err) => {
    console.error('player error', err);
    setErrorMessage('Error playing this track. Skipping...');
    setPlaying(false);
    setProgress(0);
    setDuration(0);
    setSkipNextEnded(true);
    alert('Error playing this track due to copyright. Skipping.');
    if (!isTransitioning) await playNextTrack();
  }, [isTransitioning, playNextTrack]);

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
    // Sync when parent changes initialUrl/initialTrackInfo
  useEffect(() => {
    if (initialUrl) setUrl(initialUrl);
  }, [initialUrl]);

  useEffect(() => {
    if (initialTrackInfo) setTrackInfo(initialTrackInfo);
  }, [initialTrackInfo]);

  // Spacebar & arrow keys
  useEffect(() => {
    const isInputFocused = () =>
      ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

    const onKey = (e) => {
      if (!url || isInputFocused()) return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        togglePlayPause(e);
      }

      const ip = getInternalPlayer();
      const ct = ip?.getCurrentTime?.() || 0;

      if (e.key === 'ArrowLeft') {
        const nt = Math.max(ct - 5, 0);
        playerRef.current?.seekTo(nt, 'seconds');
        if (duration > 0) setProgress(nt / duration);
      } else if (e.key === 'ArrowRight') {
        const nt = Math.min(ct + 5, duration);
        playerRef.current?.seekTo(nt, 'seconds');
        if (duration > 0) setProgress(nt / duration);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlayPause, url, duration, getInternalPlayer]);

  // Volume scroll wheel
  useEffect(() => {
    const onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.05 : 0.05;
      setVolume((v) => Math.min(1, Math.max(0, v + delta)));
    };

    const slider = volumeSliderRef.current;
    slider?.addEventListener('wheel', onWheel);
    return () => slider?.removeEventListener('wheel', onWheel);
  }, [volume]);

  // Reset when URL changes
  useEffect(() => {
    if (url) {
      setPlaying(true);
      setProgress(0);
      setDuration(0);
      setNextTrackInfo(null);
      setErrorMessage('');
      playerRef.current?.seekTo?.(0, 'seconds');
    } else {
      setPlaying(false);
    }
  }, [url]);

  // Update source without remounting
  useEffect(() => {
    const ip = getInternalPlayer();
    const vid = extractVideoId(url);
    if (url && ip && vid) {
      setTimeout(() => ip.loadVideoById(vid), 1000);
    }
  }, [url, extractVideoId, getInternalPlayer]);

  // Volume icon
  const volumeIcon = volume === 0
    ? 'fa-volume-xmark'
    : volume <= 0.5
      ? 'fa-volume-low'
      : 'fa-volume-high';

  return {
    // state & refs
    url, setUrl,
    trackInfo, setTrackInfo,
    volume, setVolume,
    playing, progress, duration,
    isPlayerReady, setIsPlayerReady,
    isBuffering, errorMessage,
    playerRef, volumeSliderRef,

    // handlers & icons
    volumeIcon,
    handleNext, handlePrev,
    togglePlayPause,
    handleSeekChange, handleVolumeChange,
    handleProgress, handleDuration,
    handleBuffer, handleBufferEnd,
    handleError, handleEnded,
  };
}
