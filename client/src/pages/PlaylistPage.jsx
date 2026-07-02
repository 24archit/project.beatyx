import { useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getPlaylistInfo, getPlaylistTracks } from "@/services/contentService";
import { PlaylistMainInfo } from "../components/PlaylistMainInfo";
import { PlaylistTrackList } from "../components/PlaylistTrackList";
import { ArtistTopTrackPartLoad } from "../components/ArtistTopTrackPart";
import { ArtistMainInfoLoad } from "../components/ArtistMainInfo";
import defaultProfilePic from "/profile-pic.webp";
import { Skeleton } from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useEffect, useRef } from "react";

export default function PlaylistPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  const observerTarget = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: playlistData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["playlist", id],
    queryFn: () => getPlaylistInfo(id).then((res) => res.playlist),

    staleTime: 15 * 60 * 1000, // Cache data for 15 minutes
    refetchOnWindowFocus: false, // Don't refetch when window is focused
  });

  const {
    data: infiniteTracksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["playlistTracks", id],
    queryFn: ({ pageParam = 100 }) => getPlaylistTracks(id, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const currentItems = lastPage?.tracks?.items || [];
      if (currentItems.length < 50) return undefined; // No more tracks
      return 100 + allPages.length * 50;
    },
    enabled: !!playlistData && playlistData.tracks.total > 100, // Only fetch if playlist has >100 tracks
    staleTime: 15 * 60 * 1000,
  });

  const allTracks = playlistData
    ? [
        ...playlistData.tracks.items,
        ...(infiniteTracksData?.pages.flatMap((page) => page.tracks.items) || []),
      ]
    : [];

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 200px 0px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Retry fallback (manual reload)
  if (isError) {
    return (
      <div className="artist-page-bg" draggable="true">
        <h2 style={{ color: "white", textAlign: "center" }}>
          Failed to load playlist.{" "}
          <button onClick={refetch} style={{ textDecoration: "underline" }}>
            Retry
          </button>
        </h2>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{playlistData ? `${playlistData.name} | Beatyx` : "Playlist | Beatyx"}</title>
        <meta
          name="description"
          content={
            playlistData
              ? `Listen to ${playlistData.name} on Beatyx. ${playlistData.description}`
              : "Stream top playlists on Beatyx."
          }
        />
      </Helmet>
      {isLoading || !playlistData ? (
        <div className="artist-page-bg" draggable="true">
          <ArtistMainInfoLoad />
          <div className="buttons-container">
            <Skeleton
              variant="rectangular"
              width={190}
              height={40}
              sx={{
                marginTop: "1.3rem",
                bgcolor: "rgba(71, 164, 211, 0.261)",
                borderRadius: "2rem",
              }}
              animation="wave"
            />
            <Skeleton
              variant="rectangular"
              width={190}
              height={40}
              sx={{
                marginTop: "1.3rem",
                bgcolor: "rgba(71, 164, 211, 0.261)",
                borderRadius: "2rem",
              }}
              animation="wave"
            />
          </div>
          <ArtistTopTrackPartLoad />
        </div>
      ) : (
        <div className="artist-page-bg" draggable="true">
          <PlaylistMainInfo
            PlaylistName={playlistData.name}
            description={playlistData.description}
            img={playlistData.images[0]?.url || defaultProfilePic}
          />
          <PlaylistTrackList
            data={allTracks}
            isPlaylist={true}
            setPlayerMeta={setPlayerMeta}
            setTrackInfo={setTrackInfo}
          />

          <div
            ref={observerTarget}
            style={{ textAlign: "center", padding: "1rem", color: "#A4A3C2" }}
          >
            {isFetchingNextPage && <p>Loading more tracks...</p>}
          </div>
        </div>
      )}
    </>
  );
}
