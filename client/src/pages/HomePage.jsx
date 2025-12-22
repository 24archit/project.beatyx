// client/src/pages/HomePage.jsx
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { 
  getTopTracksIndia, 
  getTopTracksGlobal, 
  getNewReleases, 
  getFeaturedPlaylists,
  getCategories      
} from "../apis/apiFunctions.js";

import HomePagePlaylistTrackSection from "../components/HomePagePlaylistTrackSection.jsx";
import HomePageAlbumSection from "../components/HomePageAlbumSection.jsx";
import HomePagePlaylistSection from "../components/HomePagePlaylistSection.jsx";
import HeroSection from "../components/HeroSection.jsx";
import CategoryPills from "../components/CategoryPills.jsx";
import ConnectSpotifySection from "../components/ConnectSpotifySection.jsx"; // <--- Import
import SectionLoading from "../components/SectionLoading.jsx";
import { useEffect } from "react";

export default function HomePage({ setPlayerMeta, setTrackInfo, isSpotifyConnected }) {
  
  // Queries...
  const { data: categories } = useQuery({
    queryKey: ["categories"], 
    queryFn: getCategories,
    select: (data) => data.categories.items,
    staleTime: 60 * 60 * 1000,
    enabled: !!isSpotifyConnected, 
  });

  const { data: featuredPlaylists, isLoading: loadingFeatured } = useQuery({
    queryKey: ["featuredPlaylists"], 
    queryFn: getFeaturedPlaylists,
    select: (data) => data.playlists.items, 
    staleTime: 45 * 60 * 1000,
  });

  const { data: newReleases, isLoading: loadingNewReleases } = useQuery({
    queryKey: ["newReleases"], 
    queryFn: getNewReleases,
    select: (data) => data.albums.items, 
    staleTime: 30 * 60 * 1000,
  });

  const { data: topIndiaTracks, isLoading: loadingIndia } = useQuery({
    queryKey: ["topIndiaTracks"], 
    queryFn: getTopTracksIndia,
    select: (data) => data.tracks.items, 
    staleTime: 5 * 60 * 1000,
  });

  const { data: topGlobalTracks, isLoading: loadingGlobal } = useQuery({
    queryKey: ["topGlobalTracks"], 
    queryFn: getTopTracksGlobal,
    select: (data) => data.tracks.items, 
    staleTime: 15 * 60 * 1000,
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Helmet>
        <title>Beatyx - Play Music</title>
      </Helmet>
      
      {/* 1. Category Pills */}
      <CategoryPills categories={categories} />

      {/* 2. Hero Section */}
      <HeroSection 
        data={featuredPlaylists} 
        isLoading={loadingFeatured} 
      />

      {/* 3. CONNECT SPOTIFY BANNER (Only if NOT connected) */}
      {!isSpotifyConnected && (
        <ConnectSpotifySection />
      )}
      {/* 5. Featured Playlists */}
      {!loadingFeatured && featuredPlaylists ? (
        <HomePagePlaylistSection
          iconClass="fa-solid fa-star"
          iconId="trend-icon"
          name=" Featured Playlists"
          data={featuredPlaylists.slice(1)} 
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
          sectionName="featured-playlists"
        />
      ) : <SectionLoading name=" Featured Playlists" />}

      {/* 6. Top Tracks India */}
      {!loadingIndia && topIndiaTracks ? (
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
      ) : <SectionLoading name=" Top Tracks: India" />}

       {/* 7. Global Tracks */}
       {!loadingGlobal && topGlobalTracks ? (
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
      ) : <SectionLoading name=" Global Top Tracks" />}
      {/* 4. New Releases */}
      {!loadingNewReleases && newReleases ? (
        <HomePageAlbumSection
          iconClass="fa-solid fa-compact-disc"
          iconId="trend-icon"
          name=" New Releases"
          data={newReleases}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
          sectionName="new-releases"
          button={false}
        />
      ) : <SectionLoading name=" New Releases" />}

    
    </>
  );
}