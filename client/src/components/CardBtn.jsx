// client/src/components/CardBtn.jsx
import "../assets/styles/CardBtn.css";
import { getAudioLink } from "../apis/apiFunctions";
import { useNavigate } from "react-router-dom";
import { useSharedPlayer } from "../context/PlayerContext";

export function CardBtn({
  iconId, 
  logoClass, 
  logoId, 
  cardType, 
  cardId, 
  setPlayerMeta, 
  setTrackInfo, 
  cardName, 
  imgSrc, 
  artistNames 
}) {
  const navigate = useNavigate();
  const { trackInfo: currentTrack, playing, togglePlayPause } = useSharedPlayer();

  const isTrackCard = cardType === "track";
  const isCurrentTrack = isTrackCard && currentTrack?.id === cardId;
  const isPlayingThis = isCurrentTrack && playing;

  const handelOnClick = async (e) => {
    e.stopPropagation();

    if (!isTrackCard) {
      navigate(`/${cardType}/${cardId}`);
      return;
    }

    if (isCurrentTrack) {
      togglePlayPause();
      e.target.blur();
      return;
    }

    try {
      const data = await getAudioLink(cardId);
      const url = data != null ? data.url : "";
      
      const newTrackInfo = {
        id: cardId,
        trackName: cardName,
        imgSrc: imgSrc,
        artistNames: artistNames && artistNames.length > 0 ? artistNames : ["Unknown Artist"],
      };

      setPlayerMeta(url);
      setTrackInfo(newTrackInfo);
      e.target.blur();
    } catch (error) {
      console.error("Error:", error.message || "Cannot SetUrl To Player");
      alert("This audio is not available right now");
    }
  };

  let displayIcon = logoClass;
  let hoverTitle = "Go to Page"; // Default title

  if (isTrackCard) {
    displayIcon = isPlayingThis ? "fa-solid fa-pause" : "fa-solid fa-play";
    hoverTitle = isPlayingThis ? "Pause Track" : "Play Track";
  } else {
    // Customize title based on type
    if (cardType === "playlist") hoverTitle = "View Playlist";
    else if (cardType === "artist") hoverTitle = "View Artist";
    else if (cardType === "album") hoverTitle = "View Album";
  }

  return (
    <button
      className={`play-btn india-track-play-btn ${isPlayingThis ? 'playing-active' : ''}`}
      onClick={handelOnClick}
      name={iconId === "link-btn" ? "Go To Page" : "Play Track"}
      title={hoverTitle} // Added Dynamic Label
    >
      <i className={displayIcon} id={logoId}></i>
    </button>
  );
}