// client/src/pages/CategoryPage.jsx
import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { getCategoryPlaylists } from "../apis/apiFunctions";
import { SectionCard, SectionCardLoad } from "../components/SectionCard";
import "../assets/styles/Section.css";
import "../assets/styles/CategoryPage.css"; 

export default function CategoryPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch Category Data
  const { data, isLoading } = useQuery({
    queryKey: ["categoryPlaylists", id],
    queryFn: () => getCategoryPlaylists(id),
    select: (data) => data.playlists ? data.playlists.items : [], // Safety check
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Format Title
  const categoryName = id === "made-for-you" 
    ? "Made For You" 
    : id.charAt(0).toUpperCase() + id.slice(1);

  // Check if empty
  const isEmpty = !isLoading && (!data || data.length === 0);

  return (
    <div className="page-container">
      <Helmet>
        <title>{categoryName} Mixes - Beatyx</title>
      </Helmet>

      {/* Hero Header Section */}
      <div className="category-hero">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        
        <div className="category-header-content">
          <div className="category-label">Browse Category</div>
          <h1 className="category-title">{categoryName}</h1>
          <p className="category-subtitle">
            {id === "made-for-you" 
              ? "Personalized playlists curated just for you based on your listening history."
              : `Dive into the best curated playlists for ${categoryName}. Handpicked for your mood.`
            }
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid-wrapper">
        <div className="grid-container">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SectionCardLoad key={i} />)
            : data?.map((item) => {
                // FILTERING LOGIC: Skip if item is null or missing crucial ID
                if (!item || !item.id) return null;

                return (
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
                        dangerouslySetInnerHTML={{ __html: item.description || `By ${item.owner.display_name}` }} 
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
                    spotifyUrl={item.external_urls.spotify}
                  />
                );
              })}
              
          {/* EMPTY STATE HANDLING */}
          {isEmpty && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", marginTop: "3rem", padding: "0 1rem" }}>
              {id === "made-for-you" ? (
                // Custom Message for Made For You
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                  <div style={{ fontSize: "3rem", color: "#1db954" }}>
                    <i className="fa-regular fa-compass"></i>
                  </div>
                  <h2 style={{ color: "#fff", fontSize: "1.5rem", fontWeight: "700" }}>
                    Your mix is still cooking!
                  </h2>
                  <p style={{ color: "#b3b3b3", fontSize: "1rem", maxWidth: "500px", lineHeight: "1.6" }}>
                    We don't have enough data to create personalized playlists for you yet. 
                    Start exploring the <strong>Home Page</strong>, search for your favorite artists, 
                    and listen to some music. Spotify will curate these lists once it knows your vibe!
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
                // Standard Empty State
                <div>
                  <i className="fa-regular fa-folder-open" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#2979ff" }}></i>
                  <p style={{ color: "#fff" }}>No playlists found for this category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}