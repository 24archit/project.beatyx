import "../assets/styles/TrackLineCard.css";
import trackLogo from "../assets/media/Track-Logo.webp";
import { Skeleton } from "@mui/material";
import prettyMilliseconds from "pretty-ms";
import spotifyLogo from "../assets/media/Spotify_logo.webp";
import { getAudioLink } from "../apis/apiFunctions";
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
}) {
  const handelOnClick = async (e) => {
    try {
      const currPlaylistId = window.sessionStorage.getItem("currPlaylistId");
      const queueId = window.sessionStorage.getItem("queueId");
      const data = await getAudioLink(
        cardId,
        isPlaylist,
        trackRank - 1,
        currPlaylistId,
        queueId
      );
      const url = data != null ? data.url : "";
      const trackInfo = {
        trackName: trackName,
        imgSrc: imgSrc,
      };
      setTrackInfo(trackInfo);
      setPlayerMeta(url);
      e.target.blur();
    } catch (error) {
      console.error("Error:", error.message || "Cannot SetUrl To Player");
      alert("This audio is not available right now");
    }
  };
  return (
    <>
      <div className="track-line-card">
        <div className="track-rank">
          <p>#{trackRank}</p>
        </div>
        <div className="img-container">
          <img src={imgSrc} alt="track-image" loading="lazy"></img>
        </div>
        <div className="Track-name">
          <p>{trackName}</p>
        </div>
        <div className="Track-artists-name">
          <p>{trackArtists}</p>
        </div>
        <div className="spotify-logo">
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={"Explore the content on Spotify"}
            title={"Explore the content on Spotify"}
          >
            <img src={spotifyLogo} alt="Spotify Logo" loading="lazy" />
          </a>
        </div>
        <div className="Duration">
          <p>
            {prettyMilliseconds(duration, {
              colonNotation: true,
              secondsDecimalDigits: 0,
            })}
          </p>
        </div>
        <div className="track-play" onClick={handelOnClick}>
          <i className="fa-solid fa-play" id="play-btn"></i>
        </div>
      </div>
    </>
  );
}
export function TrackLineCardLoad() {
  return (
    <>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.4rem",
        }}
      >
        <Skeleton
          variant="rectangular"
          width={30}
          height={30}
          sx={{
            bgcolor: "rgba(71, 164, 211, 0.261)",
            borderRadius: "0.3rem",
            marginRight: "2rem",
          }}
        />
        <div className="Track-name">
          <p>
            <Skeleton
              variant="rectangular"
              width={950}
              height={30}
              sx={{
                bgcolor: "rgba(71, 164, 211, 0.261)",
                borderRadius: "0.3rem",
              }}
            />
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0.4rem",
        }}
      >
        <Skeleton
          variant="rectangular"
          width={30}
          height={30}
          sx={{
            bgcolor: "rgba(71, 164, 211, 0.261)",
            borderRadius: "0.3rem",
            marginRight: "2rem",
          }}
        />
        <div className="Track-name">
          <p>
            <Skeleton
              variant="rectangular"
              width={950}
              height={30}
              sx={{
                bgcolor: "rgba(71, 164, 211, 0.261)",
                borderRadius: "0.3rem",
              }}
            />
          </p>
        </div>
      </div>
    </>
  );
}
