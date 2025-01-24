import "../assets/styles/CardBtn.css";
import { getAudioLink } from "../apis/apiFunctions";
import { useNavigate } from "react-router-dom";
export function CardBtn({iconId, logoClass, logoId, cardType, cardId, setPlayerMeta}) {
  const navigate = useNavigate();
  const handelOnClick = async () => {
    if (cardType === "track") {
      try {
        const data = await getAudioLink(cardId);
        const url = data != null ? data.url : "";
        setPlayerMeta(url);
      } catch (error) {
        console.error("Error:", error.message || "Cannot SetUrl To Player");
        alert("This audio is not available right now");
      }
    } else {
      navigate(`/${cardType}/${cardId}`);
    }
  };
    return(
        <button
          className="play-btn india-track-play-btn"
          onClick={handelOnClick}
          name={iconId === "link-btn" ? "Go To Page" : "Play Track"}
        >
          <i className={logoClass} id={logoId}></i>
        </button>
    )
}