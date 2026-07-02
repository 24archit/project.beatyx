import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { SectionName } from "./SectionName.jsx";
import { LazyImage } from "./LazyImage.jsx";
import "../assets/styles/HomePageArtistSection.css";

export default function HomePageArtistSection({ name, data, iconClass, iconId, sectionName }) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!data || data.length === 0) return null;

  const displayData = isExpanded ? data : data.slice(0, 6);

  return (
    <section className="section">
      <SectionName
        iconClass={iconClass}
        iconId={iconId}
        name={name}
        sectionName={sectionName}
        button={false}
      />

      <div className="artist-grid-container">
        {displayData.map((artist) => {
          const thumbnail = artist.images?.[0]?.url || "/default-artist.png";
          return (
            <div
              key={artist.id}
              className="artist-circular-card"
              onClick={() => navigate(`/artist/${artist.id}`)}
            >
              <div className="artist-img-wrapper">
                <LazyImage
                  src={thumbnail}
                  alt={artist.name}
                  className="artist-circular-img"
                  style={{ width: "100%", height: "100%", borderRadius: "50%" }}
                />
                <div className="artist-play-overlay">
                  <i className="fa-solid fa-play"></i>
                </div>
              </div>
              <p className="artist-name">{artist.name}</p>
              <p className="artist-label">Artist</p>
            </div>
          );
        })}
      </div>

      {data.length > 6 && (
        <div style={{ display: "flex", justifyContent: "center", margin: "0" }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: "transparent",
              border: "1px solid var(--border-mid)",
              color: "var(--text-secondary)",
              padding: "0.5rem 1.5rem",
              borderRadius: "var(--radius-full)",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
              e.currentTarget.style.borderColor = "var(--text-primary)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.borderColor = "var(--border-mid)";
            }}
          >
            {isExpanded ? "Show Less" : "See More"}
          </button>
        </div>
      )}
    </section>
  );
}
