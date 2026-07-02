import { useParams } from "react-router-dom";
import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { getPlaylistInfo, getPlaylistTracks } from "@/services/contentService";
import { getCustomPlaylist } from "@/services/customPlaylistService";
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
    queryFn: async () => {
      if (id.startsWith("btx_")) {
        const customPl = await getCustomPlaylist(id);
        return {
          id: customPl._id,
          name: customPl.name,
          description: customPl.description || `Created by ${customPl.ownerId?.displayName}`,
          owner: { display_name: customPl.ownerId?.displayName || "Beatyx User" },
          images: customPl.tracks?.[0]?.imgSrc ? [{ url: customPl.tracks[0].imgSrc }] : [],
          followers: { total: 0 },
          tracks: {
            total: customPl.tracks?.length || 0,
            items: (customPl.tracks || []).map((t) => ({
              track: {
                id: t.id,
                name: t.trackName,
                artists:
                  t.artists?.length > 0
                    ? t.artists.map((a) => ({
                        name: a.name,
                        id: a.id,
                        external_urls: { spotify: a.spotifyUrl },
                      }))
                    : (t.artistNames || []).map((name) => ({ name })),
                duration_ms: t.duration,
                external_urls: { spotify: t.spotifyUrl },
                album: { images: [{ url: t.imgSrc }] },
              },
            })),
          },
        };
      }
      const res = await getPlaylistInfo(id);
      return res.playlist;
    },

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
    queryFn: ({ pageParam = 100 }) => {
      if (id.startsWith("btx_")) return { tracks: { items: [], total: 0 } };
      return getPlaylistTracks(id, pageParam);
    },
    getNextPageParam: (lastPage, allPages) => {
      if (id.startsWith("btx_")) return undefined;
      const currentItems = lastPage?.tracks?.items || [];
      if (currentItems.length < 50 && allPages.length > 0) return undefined; // No more tracks

      const nextOffset = 100 + allPages.length * 50;
      if (playlistData?.tracks?.total && nextOffset >= playlistData.tracks.total) return undefined;

      return nextOffset;
    },
    enabled: !!playlistData && playlistData.tracks.total > 100 && !id.startsWith("btx_"), // Only fetch if playlist has >100 tracks
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
