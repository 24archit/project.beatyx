import { SectionName } from "./SectionName.jsx";
import { LazyImage } from "./LazyImage.jsx";
import "../assets/styles/HomePageRecentlyPlayedSection.css";

export default function HomePageRecentlyPlayedSection({ data, setPlayerMeta, setTrackInfo }) {
  if (!data || data.length === 0) return null;

  const handlePlay = (track) => {
    // If it's a recently played track, just play it standalone
    setPlayerMeta({
      type: "track",
      id: track.id,
      name: "Recently Played",
      description: "Jump back in",
      thumbnail: track.album?.images?.[0]?.url || "",
      tracks: [track],
    });
    setTrackInfo(track);
  };

  return (
    <section className="section">
      <SectionName
        iconClass="fa-solid fa-clock-rotate-left"
        iconId="trend-icon"
        name=" Recently Played"
        sectionName="recently-played"
        button={false}
      />

      <div className="recently-played-grid">
        {data.map((track) => {
          const thumbnail = track?.album?.images?.[0]?.url || "/default-music.png";
          const artistName = track?.artists?.[0]?.name || "Unknown Artist";
          return (
            <div key={track.id} className="recently-played-card" onClick={() => handlePlay(track)}>
              <LazyImage
                src={thumbnail}
                alt={track.name}
                className="rp-thumbnail"
                style={{ width: "100%", height: "100%", borderRadius: "4px" }}
              />
              <div className="rp-info">
                <p className="rp-title">{track.name}</p>
                <p className="rp-artist">{artistName}</p>
              </div>
              <button className="rp-play-btn">
                <i className="fa-solid fa-play"></i>
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
