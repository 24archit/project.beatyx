// client/src/components/TrackLineCard.jsx
import "../assets/styles/TrackLineCard.css";
import trackLogo from "/Track-Logo.webp";
import { Skeleton } from "@mui/material";
import prettyMilliseconds from "pretty-ms";
import { getAudioLink, addLikedSong, removeLikedSong } from "../apis/apiFunctions";
import { useSharedPlayer } from "../context/PlayerContext";
import { Link } from "react-router-dom"; // Added import

export function TrackLineCard({
  imgSrc = trackLogo,
  trackName,
  duration,
  trackRank,
  trackArtists,
  cardId,
  setPlayerMeta,
  setTrackInfo,
  spotifyUrl,
  isPlaylist = false,
  artistNames = [],
}) {
  const { 
    trackInfo: currentTrack, 
    playing, 
    togglePlayPause, 
    setTrackInfo: setContextTrackInfo,
    setUrl,
    likedSongs,
    toggleLikeLocal 
  } = useSharedPlayer();

  const isCurrentTrack = currentTrack?.id === cardId;
  const isPlayingThis = isCurrentTrack && playing;
  const isLiked = likedSongs.includes(cardId);

  const handelOnClick = async (e) => {
    e.stopPropagation(); 
    if (isCurrentTrack) {
      togglePlayPause();
      e.target.blur();
      return;
    }
    
    try {
      const currPlaylistId = window.sessionStorage.getItem("currPlaylistId");
      const queueId = window.sessionStorage.getItem("queueId");
      const data = await getAudioLink(cardId, isPlaylist, trackRank - 1, currPlaylistId, queueId);
      const url = data != null ? data.url : "";
      const newTrackInfo = { id: cardId, trackName, imgSrc, artistNames };

      if (setTrackInfo) setTrackInfo(newTrackInfo);
      if (setPlayerMeta) setPlayerMeta(url);
      e.target.blur();
    } catch (error) {
      console.error(error);
      alert("Audio Source Unavailable\n\nWe couldn't retrieve the audio source for this track right now.");
    }
  };

  const handleLikeClick = async (e) => {
    e.stopPropagation();
    const token = window.localStorage.getItem("authToken");
    
    if (!token) {
      alert(
        "Login Required\n\nYou must be logged in to save songs to your library. Please log in to your account to continue."
      );
      return;
    }

    toggleLikeLocal(cardId);
    try {
      if (isLiked) await removeLikedSong(cardId);
      else await addLikedSong(cardId);
    } catch (error) {
      toggleLikeLocal(cardId);
    }
  };

  return (
    <div className="track-line-card">
      {/* 1. Rank / Wave */}
      <div className="track-rank">
        {isPlayingThis ? (
            <div className="music-wave" title="Playing Now">
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
                <div className="bar"></div>
            </div>
        ) : (
            <p>#{trackRank}</p>
        )}
      </div>

      {/* 2. Heart Icon with Label */}
      <div 
        className="track-like-inline" 
        onClick={handleLikeClick} 
        title={isLiked ? "Remove from Liked Songs" : "Save to Liked Songs"} 
      >
         <i 
           className={isLiked ? "fa-solid fa-heart" : "fa-regular fa-heart"}
           style={{ color: isLiked ? "#1db954" : "#b3b3b3" }}
         ></i>
      </div>

      {/* 3. Image - Wrapped in Link */}
      <div className="img-container">
        <Link to={`/track/${cardId}`}>
            <img src={imgSrc} alt="track-image" loading="lazy"></img>
        </Link>
      </div>

      {/* 4. Details - Name Wrapped in Link */}
      <div className="Track-name">
        <Link to={`/track/${cardId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            <p style={isCurrentTrack ? { color: "#1db954", fontWeight: "bold" } : {}} title={trackName}>
                {trackName}
            </p>
        </Link>
      </div>
      <div className="Track-artists-name">
        <p title={trackArtists}>{trackArtists}</p>
      </div>
      
      {/* 5. Spotify Logo with Label */}
      <div className="spotify-logo">
          <a 
            href={spotifyUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            onClick={(e) => e.stopPropagation()}
            title="Open on Spotify"
          >
            <svg width="22" height="22" viewBox="0 0 168 168" role="img">
              <path fill="#ffffff" d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.2 121.2c-1.4 2.3-4.4 3-6.7 1.6-18.4-11.3-41.5-13.9-68.8-7.8-2.6.6-5.2-1-5.8-3.6-.6-2.6 1-5.2 3.6-5.8 30.5-6.8 57.3-3.7 78 9 2.2 1.4 2.9 4.4 1.7 6.6zm9.5-19.5c-1.8 2.9-5.5 3.8-8.3 2-21.1-13-53.3-16.8-78.1-9.5-3.2.9-6.5-.9-7.5-4.1-.9-3.2.9-6.5 4.1-7.5 29.7-8.5 66.4-4.2 91.6 11.1 2.8 1.8 3.6 5.5 2 8zm.9-20.6c-25.2-15.2-66.5-16.6-90.5-9.4-3.8 1.1-7.8-1-8.9-4.8-1.1-3.8 1-7.8 4.8-8.9 28.6-8.5 75.5-6.8 104.2 10.8 3.4 2 4.5 6.4 2.4 9.8-2.1 3.4-6.5 4.5-9.9 2.5z"/>
            </svg>
          </a>
      </div>

      {/* 6. Duration */}
      <div className="Duration">
        <p>{prettyMilliseconds(duration, { colonNotation: true, secondsDecimalDigits: 0 })}</p>
      </div>
      
      {/* 7. Play Button with Label */}
      <div 
        className={`track-play ${isPlayingThis ? 'active' : ''}`} 
        onClick={handelOnClick}
        title={isPlayingThis ? "Pause Track" : "Play Track"}
      >
        <i className={`fa-solid ${isPlayingThis ? "fa-pause" : "fa-play"}`} id="play-btn"></i>
      </div>
    </div>
  );
}

export function TrackLineCardLoad() {
  return (
    <div style={{ display: "flex", alignItems: "center", padding: "0.4rem" }}>
      <Skeleton variant="rectangular" width={30} height={30} sx={{ bgcolor: "rgba(71, 164, 211, 0.261)", borderRadius: "0.3rem", marginRight: "2rem" }} />
      <div className="Track-name"><p><Skeleton variant="rectangular" width={950} height={30} sx={{ bgcolor: "rgba(71, 164, 211, 0.261)", borderRadius: "0.3rem" }} /></p></div>
    </div>
  )
}