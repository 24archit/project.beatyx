import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { ArtistMainInfo, ArtistMainInfoLoad } from "../components/ArtistMainInfo.jsx";
import { ArtistTopTrackPart, ArtistTopTrackPartLoad } from "../components/ArtistTopTrackPart.jsx";
import { SectionCard, SectionCardLoad } from "../components/SectionCard.jsx";
import UpcomingConcerts from "../components/UpcomingConcerts.jsx";
import defaultProfilePic from "/profile-pic.webp";
import { getArtistInfo, getArtistAlbums } from "@/services/contentService";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Skeleton } from "@mui/material";
import "../assets/styles/ArtistPage.css";
import { followArtist, unfollowArtist, getFollowedArtists } from "@/services/userService";

export default function ArtistPage({ setPlayerMeta, setTrackInfo }) {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedBtn, setSelectedBtn] = useState("topTracks");

  const { data: followData, refetch: refetchFollow } = useQuery({
    queryKey: ["followedArtistsIds"],
    queryFn: () => getFollowedArtists(true),
    enabled: !!window.localStorage.getItem("authToken"),
  });

  const isFollowing = followData?.followedArtists?.includes(id) || false;

  const handleToggleFollow = async () => {
    const token = window.localStorage.getItem("authToken");
    if (!token) {
      alert("Please log in to follow artists.");
      return;
    }

    try {
      if (isFollowing) {
        await unfollowArtist(id);
      } else {
        await followArtist(id);
      }
      refetchFollow();
      queryClient.invalidateQueries({ queryKey: ["followedArtists"] });
    } catch (error) {
      console.error("Failed to toggle follow:", error);
      alert("Failed to update follow status.");
    }
  };

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["artist", id],
    queryFn: () => getArtistInfo(id),
    staleTime: 15 * 60 * 1000,
  });

  const {
    data: infiniteAlbumsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["artistAlbums", id],
    queryFn: ({ pageParam = 8 }) => getArtistAlbums(id, pageParam),
    getNextPageParam: (lastPage, allPages) => {
      const currentItems = lastPage?.items || [];
      if (currentItems.length < 12 && allPages.length > 0) return undefined;

      const nextOffset = 8 + allPages.length * 12;
      if (data?.ArtistTopAlbums?.total && nextOffset >= data.ArtistTopAlbums.total)
        return undefined;

      return nextOffset;
    },
    enabled: !!data?.ArtistTopAlbums && data?.ArtistTopAlbums?.total > 8,
    staleTime: 15 * 60 * 1000,
  });

  const artistData = data?.ArtistData;
  const artistTopTracks = data?.ArtistTopTracks;
  const initialAlbums = data?.ArtistTopAlbums;
  const artistShows = data?.ArtistShows;

  const allAlbums = initialAlbums
    ? [...initialAlbums.items, ...(infiniteAlbumsData?.pages.flatMap((page) => page.items) || [])]
    : [];

  const observerTarget = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          selectedBtn === "albums"
        ) {
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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, selectedBtn]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);
  return (
    <>
      {artistData && (
        <Helmet>
          {/* Dynamic Title */}
          <title>{artistData ? `${artistData.name} | Beatyx` : "Artist | Beatyx"}</title>

          {/* SEO Description */}
          <meta
            name="description"
            content={
              artistData
                ? `Listen to music by ${artistData.name} on Beatyx. Top tracks, albums, and upcoming concerts.`
                : "Discover artists on Beatyx."
            }
          />

          {/* Open Graph Tags */}
          <meta property="og:type" content="profile" />
          <meta property="og:title" content={artistData?.name} />
          <meta property="og:description" content={`Listen to ${artistData?.name} on Beatyx`} />
          <meta property="og:image" content={artistData?.images[0]?.url || defaultProfilePic} />
          <meta property="og:url" content={window.location.href} />
        </Helmet>
      )}

      <div className="artist-page-bg" draggable="true">
        {isLoading ? (
          <>
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
          </>
        ) : artistData ? (
          <>
            <ArtistMainInfo
              artistName={artistData.name}
              followers={artistData.followers.total}
              trendScore={artistData.popularity}
              img={artistData.images.length > 0 ? artistData.images[0].url : defaultProfilePic}
              isFollowing={isFollowing}
              onToggleFollow={handleToggleFollow}
            />

            <div className="buttons-container">
              <button
                className={selectedBtn === "topTracks" ? "btn selected" : "btn"}
                onClick={() => setSelectedBtn("topTracks")}
              >
                Top Tracks
              </button>
              <button
                className={selectedBtn === "albums" ? "btn selected" : "btn"}
                onClick={() => setSelectedBtn("albums")}
                style={{ marginLeft: "2rem", marginRight: "2rem" }}
              >
                Albums
              </button>

              <div className="spotify-logo">
                <a
                  href={artistData.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Explore the content on Spotify"
                  title="Explore the content on Spotify"
                >
                  <svg
                    width="30"
                    height="30"
                    viewBox="0 0 168 168"
                    xmlns="http://www.w3.org/2000/svg"
                    role="img"
                    aria-label="Spotify Logo"
                  >
                    <title>Explore Artist On Spotify</title>
                    <path
                      fill="#ffffff"
                      d="M84 0C37.7 0 0 37.7 0 84s37.7 84 84 84 84-37.7 84-84S130.3 0 84 0zm38.2 121.2c-1.4 2.3-4.4 3-6.7 1.6-18.4-11.3-41.5-13.9-68.8-7.8-2.6.6-5.2-1-5.8-3.6-.6-2.6 1-5.2 3.6-5.8 30.5-6.8 57.3-3.7 78 9 2.2 1.4 2.9 4.4 1.7 6.6zm9.5-19.5c-1.8 2.9-5.5 3.8-8.3 2-21.1-13-53.3-16.8-78.1-9.5-3.2.9-6.5-.9-7.5-4.1-.9-3.2.9-6.5 4.1-7.5 29.7-8.5 66.4-4.2 91.6 11.1 2.8 1.8 3.6 5.5 2 8zm.9-20.6c-25.2-15.2-66.5-16.6-90.5-9.4-3.8 1.1-7.8-1-8.9-4.8-1.1-3.8 1-7.8 4.8-8.9 28.6-8.5 75.5-6.8 104.2 10.8 3.4 2 4.5 6.4 2.4 9.8-2.1 3.4-6.5 4.5-9.9 2.5z"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <hr className="custom-hr" />
          </>
        ) : isError ? (
          <p style={{ color: "red" }}>Error: {error.message}</p>
        ) : null}

        {selectedBtn === "topTracks" ? (
          artistTopTracks ? (
            <ArtistTopTrackPart
              data={artistTopTracks}
              setPlayerMeta={setPlayerMeta}
              setTrackInfo={setTrackInfo}
            />
          ) : (
            <ArtistTopTrackPartLoad />
          )
        ) : (
          <div className="section">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
                gap: "1.5rem",
                padding: "1rem",
              }}
            >
              {initialAlbums ? (
                allAlbums.map((item, index) => (
                  <SectionCard
                    key={`${item.id}-${index}`}
                    imgSrc={item.images[0]?.url || defaultProfilePic}
                    cardName={item.name}
                    cardStat={
                      <>
                        {item.artists.map((artist, idx) => (
                          <span key={artist.id}>
                            <Link to={`/artist/${artist.id}`} className="card-stat-links">
                              {artist.name}
                            </Link>
                            {idx < item.artists.length - 1 ? ", " : ""}
                          </span>
                        ))}
                      </>
                    }
                    albumType={item.album_type}
                    cardId={item.id}
                    setPlayerMeta={setPlayerMeta}
                    setTrackInfo={setTrackInfo}
                    cardType="album"
                  />
                ))
              ) : (
                <>
                  <SectionCardLoad />
                  <SectionCardLoad />
                  <SectionCardLoad />
                  <SectionCardLoad />
                  <SectionCardLoad />
                  <SectionCardLoad />
                </>
              )}
            </div>
            <div
              ref={observerTarget}
              style={{ textAlign: "center", padding: "1rem", color: "#A4A3C2" }}
            >
              {isFetchingNextPage && <p>Loading more albums...</p>}
            </div>
          </div>
        )}
      </div>

      <UpcomingConcerts artistShows={artistShows} />
    </>
  );
}
