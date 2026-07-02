import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueries } from "@tanstack/react-query";
import { getUserProfile } from "@/services/userService";
import { getAlbumInfo } from "@/services/contentService";
import { SectionCard, SectionCardLoad } from "@/components/SectionCard";
import "../assets/styles/PlaylistsPage.css"; // We can reuse the styling

export default function AlbumsPage() {
  const navigate = useNavigate();
  const authToken = window.localStorage.getItem("authToken");

  React.useEffect(() => {
    if (!authToken) {
      navigate("/");
    }
  }, [authToken, navigate]);

  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: !!authToken,
    staleTime: 5 * 60 * 1000,
  });

  const savedAlbumQueries = useQueries({
    queries: (userProfile?.user?.savedAlbums || []).map((id) => ({
      queryKey: ["albumInfo", id],
      queryFn: () => getAlbumInfo(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const savedAlbumsData = savedAlbumQueries.map((q) => q.data).filter(Boolean);
  const isLoadingAlbums = savedAlbumQueries.some((q) => q.isLoading);

  return (
    <div className="playlists-page-container">
      <div className="playlists-header">
        <h1>Saved Albums</h1>
      </div>

      <div className="playlists-content" style={{ marginTop: "20px" }}>
        <div className="playlists-grid">
          {isLoadingProfile || isLoadingAlbums ? (
            Array(4)
              .fill(0)
              .map((_, i) => <SectionCardLoad key={i} />)
          ) : savedAlbumsData?.length > 0 ? (
            savedAlbumsData.map((album) => (
              <SectionCard
                key={album.id}
                cardId={album.id}
                cardName={album.name}
                cardStat={`By ${album.artists?.[0]?.name || "Spotify"}`}
                cardType="album"
                imgSrc={album.images?.[0]?.url || "/Track-Logo.webp"}
              />
            ))
          ) : (
            <div className="empty-state">
              <i className="fa-solid fa-compact-disc"></i>
              <p>You haven&apos;t saved any albums.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
