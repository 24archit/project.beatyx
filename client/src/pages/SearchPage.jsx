import React from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { useEffect } from "react";
import { getSearchResult } from "../apis/apiFunctions";
import SectionLoading from "../components/SectionLoading";
import SearchPageTrackSection from "../components/SearchPageTrackSection";
import SearchPageArtistSection from "../components/SearchPageArtistSection";
import SearchPageAlbumSection from "../components/SearchPageAlbumSection";
import SearchPagePlaylistSection from "../components/SearchPagePlaylistSection";
import { SectionNameLoad } from "../components/SectionName";
import { SectionCardLoad } from "../components/SectionCard";

export default function SearchPage({ setPlayerMeta, setTrackInfo }) {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") || "";
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const {
    data: searchResult,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["searchResult", query, type],
    queryFn: async () => {
      const data = await getSearchResult(query, type);

      if (type === "track,artist,album,playlist,show,episode") {
        return {
          topResult: data.tracks?.items?.[0] ? [data.tracks.items[0]] : [],
          otherResult: data.tracks?.items?.slice(1) || [],
          artistResult: data.artists?.items?.slice(0, 8) || [],
          albumResult: data.albums?.items?.slice(0, 8) || [],
          playlistResult: data.playlists?.items?.slice(0, 8) || [],
        };
      } else {
        return {
          topResult: data[`${type}s`]?.items?.[0]
            ? [data[`${type}s`].items[0]]
            : [],
          otherResult: data[`${type}s`]?.items?.slice(1) || [],
        };
      }
    },
    enabled: !!query && !!type,
    retry: 2,
    staleTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

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
        <Component
          iconClass="fa-brands fa-artstation"
          iconId="artstation-icon"
          name=" Other Related Results"
          data={data.otherResult}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
        />
      )}
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
      return renderSection(
        SearchPagePlaylistSection,
        "Playlists",
        searchResult
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
        </>
      );
  }
}
