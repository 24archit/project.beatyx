import React, { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; 
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getCategoryPlaylists } from "../apis/apiFunctions";
import { SectionCard, SectionCardLoad } from "../components/SectionCard";
import "../assets/styles/Section.css";
import "../assets/styles/CategoryPage.css"; 

export default function CategoryPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); 

  // 1. Determine Title
  let displayName;
  if (location.state && location.state.categoryName) {
    displayName = location.state.categoryName;
  } else if (id === "made-for-you") {
    displayName = "Made For You";
  } else {
    displayName = id.charAt(0).toUpperCase() + id.slice(1);
  }

  // 2. Fetch Data
  const { data, isLoading } = useQuery({
    queryKey: ["categoryPlaylists", id],
    queryFn: () => getCategoryPlaylists(id),
    select: (data) => {
      // Safety: Return empty array if structure is missing
      if (!data || !data.playlists || !data.playlists.items) return [];
      return data.playlists.items;
    },
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // 3. FILTERING LOGIC (The part you asked about)
  // This runs for EVERY item individually. 
  // It only removes specific items that fail the check.
  const validPlaylists = data 
    ? data.filter(item => {
        // Must exist and have an ID
        if (!item || !item.id) return false;
        
        // If track count is provided, it must be greater than 0
        // We use '?.' to be safe in case 'tracks' is undefined
        if (item.tracks?.total === 0) return false; 
        
        return true; // Keep this playlist
      })
    : [];

  // 4. Empty State Condition
  // This is true ONLY if we have 0 valid playlists left.
  const isEmpty = !isLoading && validPlaylists.length === 0;

  return (
    <div className="page-container">
      <Helmet>
        <title>{displayName} - Beatyx</title>
      </Helmet>

      {/* Hero Header */}
      <div className="category-hero">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        
        <div className="category-header-content">
          <div className="category-label">Browse</div>
          <h1 className="category-title">{displayName}</h1>
          <p className="category-subtitle">
            {id === "made-for-you" 
              ? "Personalized playlists curated just for you based on your listening history."
              : `The best curated playlists for ${displayName}. Handpicked for your mood.`
            }
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid-wrapper">
        <div className="grid-container">
          
          {/* Loading Skeletons */}
          {isLoading && Array.from({ length: 8 }).map((_, i) => <SectionCardLoad key={i} />)}

          {/* Render Valid Playlists */}
          {!isLoading && validPlaylists.map((item) => (
            <SectionCard
              key={item.id}
              imgSrc={item.images?.[0]?.url}
              cardName={item.name}
              cardId={item.id}
              cardType="playlist"
              setPlayerMeta={setPlayerMeta}
              setTrackInfo={setTrackInfo}
              cardStat={
                <span 
                  className="card-stat-text" 
                  dangerouslySetInnerHTML={{ __html: item.description || `By ${item.owner?.display_name || 'Spotify'}` }} 
                  style={{ 
                    display: '-webkit-box', 
                    WebkitLineClamp: 2, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden',
                    fontSize: '0.75rem',
                    color: '#a0a0a0'
                  }}
                />
              }
              spotifyUrl={item.external_urls?.spotify}
            />
          ))}
              
          {/* Empty State (Only shows if ALL are filtered out) */}
          {isEmpty && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "3rem", padding: "0 1rem" }}>
              {id === "made-for-you" ? (
                // Made For You Empty Message
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "3rem", color: "#1db954" }}>
                    <i className="fa-regular fa-compass"></i>
                  </div>
                  <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700" }}>
                    Your mix is still cooking!
                  </h2>
                  <p style={{ color: "#b3b3b3", fontSize: "1rem", maxWidth: "500px", lineHeight: "1.6" }}>
                    We couldn't find any tracks in your personal mixes yet. 
                    Start exploring the <strong>Home Page</strong>, listen to some music, and check back later!
                  </p>
                  <button 
                    onClick={() => navigate("/")}
                    style={{
                      marginTop: "1rem",
                      padding: "12px 28px",
                      borderRadius: "50px",
                      border: "none",
                      backgroundColor: "#fff",
                      color: "#000",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "1rem"
                    }}
                  >
                    Start Exploring
                  </button>
                </div>
              ) : (
                // Generic Empty Message
                <div>
                  <i className="fa-regular fa-folder-open" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#2979ff" }}></i>
                  <p style={{ color: "#fff", fontSize: "1.2rem", fontWeight: "600" }}>No playlists found.</p>
                  <p style={{ color: "#a0a0a0" }}>This category appears to be empty.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}