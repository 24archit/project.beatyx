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
    select: (data) => data.playlists.items,
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const categoryName = id.charAt(0).toUpperCase() + id.slice(1);

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
            Dive into the best curated playlists for <strong>{categoryName}</strong>. 
            Handpicked for your mood.
          </p>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid-wrapper">
        <div className="grid-container">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <SectionCardLoad key={i} />)
            : data?.map((item) => (
                item ? (
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
                ) : null
              ))}
              
          {!isLoading && (!data || data.length === 0) && (
            <div style={{ color: "#fff", gridColumn: "1 / -1", textAlign: "center", marginTop: "2rem" }}>
              <i className="fa-regular fa-folder-open" style={{ fontSize: "2rem", marginBottom: "1rem", color: "#2979ff" }}></i>
              <p>No playlists found for this category.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}