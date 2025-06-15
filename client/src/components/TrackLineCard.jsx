import "../assets/styles/TrackLineCard.css";
import trackLogo from "/Track-Logo.webp";
import { Skeleton } from "@mui/material";
import prettyMilliseconds from "pretty-ms";
import spotifyLogo from "/Spotify_logo.webp";
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
  artistNames = [],
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
        artistNames: artistNames,
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
            aria-label="Explore the content on Spotify"
            title="Explore the content on Spotify"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 168 168"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="Spotify Logo"
            >
              <title>Explore Content In Spotify</title>
              <path
                fill="#ffffff"
                d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.2 121.2c-1.4 2.3-4.4 3-6.7 1.6-18.4-11.3-41.5-13.9-68.8-7.8-2.6.6-5.2-1-5.8-3.6-.6-2.6 1-5.2 3.6-5.8 30.5-6.8 57.3-3.7 78 9 2.2 1.4 2.9 4.4 1.7 6.6zm9.5-19.5c-1.8 2.9-5.5 3.8-8.3 2-21.1-13-53.3-16.8-78.1-9.5-3.2.9-6.5-.9-7.5-4.1-.9-3.2.9-6.5 4.1-7.5 29.7-8.5 66.4-4.2 91.6 11.1 2.8 1.8 3.6 5.5 2 8zm.9-20.6c-25.2-15.2-66.5-16.6-90.5-9.4-3.8 1.1-7.8-1-8.9-4.8-1.1-3.8 1-7.8 4.8-8.9 28.6-8.5 75.5-6.8 104.2 10.8 3.4 2 4.5 6.4 2.4 9.8-2.1 3.4-6.5 4.5-9.9 2.5z"
              />
            </svg>
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
