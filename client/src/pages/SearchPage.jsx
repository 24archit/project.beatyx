import { useSearchParams } from "react-router-dom";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useEffect, useRef } from "react";
import { getSearchResult } from "@/services/contentService";
import { searchCustomPlaylists } from "@/services/customPlaylistService";
import SectionLoading from "../components/SectionLoading";
import SearchPageTrackSection from "../components/SearchPageTrackSection";
import SearchPageArtistSection from "../components/SearchPageArtistSection";
import SearchPageAlbumSection from "../components/SearchPageAlbumSection";
import SearchPagePlaylistSection from "../components/SearchPagePlaylistSection";
import { SectionNameLoad } from "../components/SectionName";
import { SectionCard, SectionCardLoad } from "../components/SectionCard";

export default function SearchPage({ setPlayerMeta, setTrackInfo }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const isAllSearch = type === "track,artist,album,playlist,show,episode";

  const {
    data: infiniteSearchData,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["searchResult", query, type],
    queryFn: async ({ pageParam = 0 }) => {
      const data = await getSearchResult(query, type, pageParam);

      if (isAllSearch) {
        return {
          topResult: data.tracks?.items?.[0] ? [data.tracks.items[0]] : [],
          otherResult: data.tracks?.items?.slice(1) || [],
          artistResult: data.artists?.items?.slice(0, 8) || [],
          albumResult: data.albums?.items?.slice(0, 8) || [],
          playlistResult: data.playlists?.items?.slice(0, 8) || [],
        };
      } else {
        return {
          topResult:
            pageParam === 0 && data[`${type}s`]?.items?.[0] ? [data[`${type}s`].items[0]] : [],
          otherResult:
            pageParam === 0
              ? data[`${type}s`]?.items?.slice(1) || []
              : data[`${type}s`]?.items || [],
          total: data[`${type}s`]?.total || 0,
        };
      }
    },
    getNextPageParam: (lastPage, allPages) => {
      if (isAllSearch) return undefined; // No infinite scroll for "All" view

      const nextOffset = allPages.length * 20;
      // Spotify API limits offset to a maximum of 1000
      if (nextOffset >= 1000) return undefined;

      const currentCount = allPages.reduce(
        (acc, page) => acc + page.topResult.length + page.otherResult.length,
        0
      );

      if (lastPage.total && currentCount >= lastPage.total) return undefined;

      const lastPageCount = lastPage.topResult.length + lastPage.otherResult.length;
      if (lastPageCount < 20 && allPages.length > 0) return undefined; // Less than limit means no more pages

      return nextOffset;
    },
    enabled: !!query && !!type,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const { data: customPlaylistsData, isLoading: isCustomLoading } = useQuery({
    queryKey: ["customPlaylistsSearch", query],
    queryFn: () => searchCustomPlaylists(query),
    enabled: !!query && (isAllSearch || type === "playlist"),
    staleTime: 5 * 60 * 1000,
  });

  const searchResult = infiniteSearchData
    ? {
        topResult: infiniteSearchData.pages[0]?.topResult || [],
        otherResult: infiniteSearchData.pages.flatMap((page) => page.otherResult) || [],
        artistResult: infiniteSearchData.pages[0]?.artistResult || [],
        albumResult: infiniteSearchData.pages[0]?.albumResult || [],
        playlistResult: infiniteSearchData.pages[0]?.playlistResult || [],
      }
    : null;

  const observerTarget = useRef(null);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 200px 0px" }
    );

    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Search | Beatyx</title>
        </Helmet>
        <section className="section">
          <SectionNameLoad />
          <div className="material" draggable="true">
            <SectionCardLoad />
          </div>
        </section>
        <SectionLoading />
        <SectionLoading />
      </>
    );
  }

  if (isError) {
    return (
      <div style={{ textAlign: "center", paddingTop: "2rem", color: "white" }}>
        <h2>Failed to load search results</h2>
        <button
          onClick={refetch}
          style={{
            background: "#1db954",
            color: "white",
            padding: "0.6rem 1.2rem",
            border: "none",
            borderRadius: "1rem",
            cursor: "pointer",
            marginTop: "1rem",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const renderSection = (Component, name, data) => (
    <>
      <Helmet>
        <title>Search | Beatyx</title>
      </Helmet>
      {data.topResult.length > 0 && (
        <Component
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Top Search Result"
          data={data.topResult}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
        />
      )}
      {data.otherResult.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: "1.5rem",
            padding: "1rem",
          }}
        >
          {data.otherResult.map((item, index) => {
            const imgSrc =
              item.album?.images?.[0]?.url || item.images?.[0]?.url || "/Track-Logo.webp";
            return (
              <SectionCard
                key={`${item.id}-${index}`}
                imgSrc={imgSrc}
                cardName={item.name}
                cardStat={item.artists ? item.artists.map((a) => a.name).join(", ") : ""}
                cardType={
                  type === "artist"
                    ? "artist"
                    : type === "album"
                      ? "album"
                      : type === "playlist"
                        ? "playlist"
                        : "track"
                }
                cardId={item.id}
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
              />
            );
          })}
        </div>
      )}
      <div ref={observerTarget} style={{ textAlign: "center", padding: "1rem", color: "#A4A3C2" }}>
        {isFetchingNextPage && <p>Loading more results...</p>}
      </div>
    </>
  );

  switch (type) {
    case "track":
      return renderSection(SearchPageTrackSection, "Tracks", searchResult);
    case "artist":
      return renderSection(SearchPageArtistSection, "Artists", searchResult);
    case "album":
      return renderSection(SearchPageAlbumSection, "Albums", searchResult);
    case "playlist":
      return (
        <>
          {renderSection(SearchPagePlaylistSection, "Playlists", searchResult)}
          {customPlaylistsData?.length > 0 && (
            <SearchPagePlaylistSection
              iconClass="fa-solid fa-music"
              iconId="artstation-icon"
              name=" Beatyx Custom Playlists"
              data={customPlaylistsData.map((pl) => ({
                id: pl._id,
                name: pl.name,
                description: pl.description || `Created by ${pl.ownerId?.displayName}`,
                images: pl.tracks?.[0]?.imgSrc ? [{ url: pl.tracks[0].imgSrc }] : [],
                owner: { display_name: pl.ownerId?.displayName || "Beatyx User" },
                type: "playlist",
                isOwner: pl.isOwner,
              }))}
            />
          )}
        </>
      );
    default:
      return (
        <>
          <Helmet>
            <title>Search | Beatyx</title>
          </Helmet>
          {searchResult?.topResult?.length > 0 && (
            <SearchPageTrackSection
              iconClass="fa-solid fa-arrow-trend-up"
              iconId="trend-icon"
              name=" Top Search Result"
              data={searchResult.topResult}
              setPlayerMeta={setPlayerMeta}
              setTrackInfo={setTrackInfo}
            />
          )}
          {searchResult?.otherResult?.length > 0 && (
            <SearchPageTrackSection
              iconClass="fa-brands fa-artstation"
              iconId="artstation-icon"
              name=" Other Related Results"
              data={searchResult.otherResult}
              setPlayerMeta={setPlayerMeta}
              setTrackInfo={setTrackInfo}
            />
          )}
          {searchResult?.artistResult?.length > 0 && (
            <SearchPageArtistSection
              iconClass="fa-brands fa-artstation"
              iconId="artstation-icon"
              name=' "Artists" Related To Your Search'
              data={searchResult.artistResult}
            />
          )}
          {searchResult?.albumResult?.length > 0 && (
            <SearchPageAlbumSection
              iconClass="fa-brands fa-artstation"
              iconId="artstation-icon"
              name=' "Albums" Related To Your Search'
              data={searchResult.albumResult}
            />
          )}
          {searchResult?.playlistResult?.length > 0 && (
            <SearchPagePlaylistSection
              iconClass="fa-brands fa-artstation"
              iconId="artstation-icon"
              name=' "Playlists" Related To Your Search'
              data={searchResult.playlistResult}
            />
          )}
          {customPlaylistsData?.length > 0 && (
            <SearchPagePlaylistSection
              iconClass="fa-solid fa-music"
              iconId="artstation-icon"
              name=" Beatyx Custom Playlists"
              data={customPlaylistsData.map((pl) => ({
                id: pl._id,
                name: pl.name,
                description: pl.description || `Created by ${pl.ownerId?.displayName}`,
                images: pl.tracks?.[0]?.imgSrc ? [{ url: pl.tracks[0].imgSrc }] : [],
                owner: { display_name: pl.ownerId?.displayName || "Beatyx User" },
                type: "playlist",
                isOwner: pl.isOwner,
              }))}
            />
          )}
        </>
      );
  }
}
