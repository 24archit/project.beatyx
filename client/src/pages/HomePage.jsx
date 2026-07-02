// client/src/pages/HomePage.jsx
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import {
  getTopTracksIndia,
  getTopTracksGlobal,
  getNewReleases,
  getFeaturedPlaylists,
  getCategories,
  getTrendingArtists,
  getTrendingArtistsIndia,
  getUserTopItems,
} from "@/services/contentService";

import { useSharedPlayer } from "@/features/player";
import HomePagePlaylistTrackSection from "../components/HomePagePlaylistTrackSection.jsx";
import HomePageAlbumSection from "../components/HomePageAlbumSection.jsx";
import HomePagePlaylistSection from "../components/HomePagePlaylistSection.jsx";
import HomePageRecentlyPlayedSection from "../components/HomePageRecentlyPlayedSection.jsx";
import HomePageArtistSection from "../components/HomePageArtistSection.jsx";
import HeroSection from "../components/HeroSection.jsx";
import CategoryPills from "../components/CategoryPills.jsx";
import ConnectSpotifySection from "../components/ConnectSpotifySection.jsx";
import HomePageConcertsBanner from "../components/HomePageConcertsBanner.jsx";
import SectionLoading from "../components/SectionLoading.jsx";
import { ScrollReveal } from "../components/ScrollReveal.jsx";
import { useEffect } from "react";

export default function HomePage({ setPlayerMeta, setTrackInfo, isSpotifyConnected }) {
  const { recentlyPlayed } = useSharedPlayer();
  // Queries...
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    select: (data) => data?.categories?.items || [],
    staleTime: 60 * 60 * 1000,
    enabled: !!isSpotifyConnected,
  });

  const {
    data: featuredPlaylists,
    isLoading: loadingFeatured,
    isError: errorFeatured,
  } = useQuery({
    queryKey: ["featuredPlaylists"],
    queryFn: getFeaturedPlaylists,
    select: (data) => data.playlists.items,
    staleTime: 45 * 60 * 1000,
  });

  const {
    data: newReleases,
    isLoading: loadingNewReleases,
    isError: errorNewReleases,
  } = useQuery({
    queryKey: ["newReleases"],
    queryFn: getNewReleases,
    select: (data) => data.albums.items,
    staleTime: 30 * 60 * 1000,
  });

  const {
    data: topIndiaTracks,
    isLoading: loadingIndia,
    isError: errorIndia,
  } = useQuery({
    queryKey: ["topIndiaTracks"],
    queryFn: getTopTracksIndia,
    select: (data) => data.tracks.items,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: topGlobalTracks,
    isLoading: loadingGlobal,
    isError: errorGlobal,
  } = useQuery({
    queryKey: ["topGlobalTracks"],
    queryFn: getTopTracksGlobal,
    select: (data) => data.tracks.items,
    staleTime: 15 * 60 * 1000,
  });

  const { data: trendingArtists, isLoading: loadingTrendingArtists } = useQuery({
    queryKey: ["trendingArtists"],
    queryFn: getTrendingArtists,
    select: (data) => data.artists,
    staleTime: 60 * 60 * 1000,
  });

  const { data: trendingArtistsIndia, isLoading: loadingTrendingArtistsIndia } = useQuery({
    queryKey: ["trendingArtistsIndia"],
    queryFn: getTrendingArtistsIndia,
    select: (data) => data.artists,
    staleTime: 60 * 60 * 1000,
  });

  const { data: userTopItems, isLoading: loadingUserTopItems } = useQuery({
    queryKey: ["userTopItems"],
    queryFn: getUserTopItems,
    enabled: !!isSpotifyConnected,
    staleTime: 15 * 60 * 1000,
  });

  const isServerDown = errorFeatured || errorNewReleases || errorIndia || errorGlobal;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Beatyx - Play Music</title>
      </Helmet>

      {isServerDown ? (
        <div
          style={{ textAlign: "center", paddingTop: "5rem", paddingBottom: "5rem", color: "white" }}
        >
          <i
            className="fa-solid fa-server"
            style={{ fontSize: "4rem", marginBottom: "1.5rem", color: "#A4A3C2" }}
          ></i>
          <h2 style={{ fontSize: "2rem", marginBottom: "1rem" }}>Server Under Maintenance</h2>
          <p style={{ color: "#A4A3C2", fontSize: "1.2rem", maxWidth: "500px", margin: "0 auto" }}>
            We are currently experiencing technical difficulties or performing scheduled
            maintenance. Please try again later.
          </p>
        </div>
      ) : (
        <>
          {/* 1. Category Pills */}
          <CategoryPills categories={categories} />

          {/* 2. Hero Section */}
          <HeroSection data={featuredPlaylists} isLoading={loadingFeatured} />

          {/* 2.2 Concerts Banner */}
          <ScrollReveal>
            <HomePageConcertsBanner />
          </ScrollReveal>

          {/* 2.5 Recently Played (Local) */}
          {recentlyPlayed && recentlyPlayed.length > 0 && (
            <ScrollReveal>
              <HomePageRecentlyPlayedSection
                data={recentlyPlayed}
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
              />
            </ScrollReveal>
          )}

          {/* 3. CONNECT SPOTIFY BANNER (Only if NOT connected) */}
          {!isSpotifyConnected && <ConnectSpotifySection />}

          {/* 3.5 Made For You (Spotify Connected) */}
          {isSpotifyConnected && userTopItems && !loadingUserTopItems && (
            <ScrollReveal>
              {userTopItems.topTracks?.items?.length > 0 && (
                <HomePagePlaylistTrackSection
                  iconClass="fa-solid fa-heart"
                  iconId="trend-icon"
                  name=" Made For You"
                  data={userTopItems.topTracks.items.map((track) => ({ track }))} // normalize to look like playlist tracks
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                  showMore={false}
                  sectionName="made-for-you-tracks"
                />
              )}
            </ScrollReveal>
          )}

          {/* 4. Featured Playlists */}
          {!loadingFeatured && featuredPlaylists ? (
            <ScrollReveal>
              <HomePagePlaylistSection
                iconClass="fa-solid fa-star"
                iconId="trend-icon"
                name=" Featured Playlists"
                data={featuredPlaylists.slice(1)}
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
                sectionName="featured-playlists"
              />
            </ScrollReveal>
          ) : (
            <SectionLoading name=" Featured Playlists" />
          )}

          {/* 5. Trending Artists India */}
          {!loadingTrendingArtistsIndia && trendingArtistsIndia && (
            <ScrollReveal>
              <HomePageArtistSection
                iconClass="fa-solid fa-fire"
                iconId="trend-icon"
                name=" Trending Artists: India"
                data={trendingArtistsIndia}
                sectionName="trending-artists-india"
              />
            </ScrollReveal>
          )}

          {/* 6. Top Tracks India */}
          {!loadingIndia && topIndiaTracks ? (
            <ScrollReveal>
              <HomePagePlaylistTrackSection
                iconClass="fa-solid fa-arrow-trend-up"
                iconId="trend-icon"
                name=" Top Tracks: India"
                data={topIndiaTracks.slice(0, 10)}
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
                showMore={topIndiaTracks.length > 45}
                sectionName="top-tracks-india"
                routeTo="/playlist/37i9dQZEVXbLZ52XmnySJg"
              />
            </ScrollReveal>
          ) : (
            <SectionLoading name=" Top Tracks: India" />
          )}

          {/* 7. Trending Artists Global */}
          {!loadingTrendingArtists && trendingArtists && (
            <ScrollReveal>
              <HomePageArtistSection
                iconClass="fa-solid fa-fire"
                iconId="trend-icon"
                name=" Global Trending Artists"
                data={trendingArtists}
                sectionName="trending-artists"
              />
            </ScrollReveal>
          )}

          {/* 8. Global Tracks */}
          {!loadingGlobal && topGlobalTracks ? (
            <ScrollReveal>
              <HomePagePlaylistTrackSection
                iconClass="fa-solid fa-globe"
                iconId="trend-icon"
                name=" Global Top Tracks"
                data={topGlobalTracks.slice(0, 10)}
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
                showMore={topGlobalTracks.length > 45}
                sectionName="top-tracks-global"
                routeTo="/playlist/37i9dQZEVXbMDoHDwVN2tF"
              />
            </ScrollReveal>
          ) : (
            <SectionLoading name=" Global Top Tracks" />
          )}

          {/* 9. New Releases */}
          {!loadingNewReleases && newReleases ? (
            <ScrollReveal>
              <HomePageAlbumSection
                iconClass="fa-solid fa-compact-disc"
                iconId="trend-icon"
                name=" New Releases"
                data={newReleases}
                setPlayerMeta={setPlayerMeta}
                setTrackInfo={setTrackInfo}
                sectionName="new-releases"
              />
            </ScrollReveal>
          ) : (
            <SectionLoading name=" New Releases" />
          )}
        </>
      )}
    </>
  );
}
