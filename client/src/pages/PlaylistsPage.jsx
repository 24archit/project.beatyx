import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getMyCustomPlaylists, getMySavedPlaylists } from "@/services/customPlaylistService";
import { SectionCard, SectionCardLoad } from "@/components/SectionCard";
import { getPlaylistInfo } from "@/services/contentService";
import "../assets/styles/PlaylistsPage.css";

export default function PlaylistsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mine"); // 'mine' or 'saved'
  const authToken = window.localStorage.getItem("authToken");

  React.useEffect(() => {
    if (!authToken) {
      navigate("/");
    }
  }, [authToken, navigate]);

  const { data: myPlaylists, isLoading: isLoadingMine } = useQuery({
    queryKey: ["myCustomPlaylists"],
    queryFn: getMyCustomPlaylists,
    enabled: !!authToken,
  });

  const { data: savedData, isLoading: isLoadingSaved } = useQuery({
    queryKey: ["mySavedPlaylists"],
    queryFn: getMySavedPlaylists,
    enabled: !!authToken,
  });

  const spotifyPlaylistQueries = useQueries({
    queries: (savedData?.spotifySavedPlaylistIds || []).map((id) => ({
      queryKey: ["spotifyPlaylist", id],
      queryFn: () => getPlaylistInfo(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const spotifyPlaylistsData = spotifyPlaylistQueries.map((q) => q.data).filter(Boolean);

  const isLoadingSpotify = spotifyPlaylistQueries.some((q) => q.isLoading);

  const handleCreate = () => {
    document.dispatchEvent(new CustomEvent("openPlaylistDialog", { detail: { mode: "create" } }));
  };

  return (
    <div className="playlists-page-container">
      <div className="playlists-header">
        <h1>Playlists</h1>
        <button className="btn btn-primary create-btn" onClick={handleCreate}>
          <i className="fa-solid fa-plus"></i> Create Playlist
        </button>
      </div>

      <div className="playlists-tabs">
        <button
          className={`pl-tab ${activeTab === "mine" ? "active" : ""}`}
          onClick={() => setActiveTab("mine")}
        >
          My Playlists
        </button>
        <button
          className={`pl-tab ${activeTab === "saved" ? "active" : ""}`}
          onClick={() => setActiveTab("saved")}
        >
          Saved Playlists
        </button>
      </div>

      <div className="playlists-content">
        {activeTab === "mine" && (
          <div className="playlists-grid">
            {isLoadingMine ? (
              Array(4)
                .fill(0)
                .map((_, i) => <SectionCardLoad key={i} />)
            ) : myPlaylists?.length > 0 ? (
              myPlaylists.map((pl) => (
                <SectionCard
                  key={pl._id}
                  cardId={pl._id}
                  cardName={pl.name}
                  cardStat={pl.isPublic ? "Public Playlist" : "Private Playlist"}
                  cardType="playlist"
                  imgSrc={pl.tracks?.[0]?.imgSrc || "/Track-Logo.webp"}
                  isOwner={true}
                />
              ))
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-music"></i>
                <p>You haven&apos;t created any playlists yet.</p>
                <button className="btn btn-primary" onClick={handleCreate}>
                  Create One Now
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="playlists-grid">
            {isLoadingSaved || isLoadingSpotify ? (
              Array(4)
                .fill(0)
                .map((_, i) => <SectionCardLoad key={i} />)
            ) : savedData?.customSavedPlaylists?.length > 0 || spotifyPlaylistsData.length > 0 ? (
              <>
                {savedData.customSavedPlaylists.map((pl) => (
                  <SectionCard
                    key={pl._id}
                    cardId={pl._id}
                    cardName={pl.name}
                    cardStat={`By ${pl.ownerId?.displayName || "Beatyx User"}`}
                    cardType="playlist"
                    imgSrc={pl.tracks?.[0]?.imgSrc || "/Track-Logo.webp"}
                    isOwner={false}
                  />
                ))}
                {spotifyPlaylistsData.map((pl) => (
                  <SectionCard
                    key={pl.id}
                    cardId={pl.id}
                    cardName={pl.name}
                    cardStat={`By ${pl.owner?.display_name || "Spotify"}`}
                    cardType="playlist"
                    imgSrc={pl.images?.[0]?.url || "/Track-Logo.webp"}
                    isOwner={false}
                  />
                ))}
              </>
            ) : (
              <div className="empty-state">
                <i className="fa-solid fa-bookmark"></i>
                <p>You haven&apos;t saved any playlists.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
