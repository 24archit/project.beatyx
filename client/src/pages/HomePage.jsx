import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { getTopTracksIndia, getTopTracksGlobal } from "../apis/apiFunctions.js";
import HomePagePlaylistTrackSection from "../components/HomePagePlaylistTrackSection.jsx";
import SectionLoading from "../components/SectionLoading.jsx";
import { useEffect } from "react";

export default function HomePage({ setPlayerMeta, setTrackInfo }) {
  const { data: topIndiaTracks, isLoading: loadingIndia } = useQuery({
    queryKey: ["topIndiaTracks"],
    queryFn: getTopTracksIndia,
    select: (data) => data.tracks.items,
    staleTime: 5 * 60 * 1000, // 5 min caching
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

      {!loadingIndia && topIndiaTracks ? (
        <HomePagePlaylistTrackSection
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Top Tracks: Live from India"
          data={topIndiaTracks.slice(0, 7)}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
          showMore={topIndiaTracks.length > 45}
          onMoreClick={() => {
            /* handle see more */
          }}
          sectionName="top-tracks-india"
          routeTo="/playlist/37i9dQZEVXbLZ52XmnySJg"
        />
      ) : (
        <SectionLoading
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Top Tracks: Live from India"
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
        />
      )}

      {!loadingGlobal && topGlobalTracks ? (
        <HomePagePlaylistTrackSection
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Sync: Global Top Tracks"
          data={topGlobalTracks.slice(0, 7)}
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
          showMore={topGlobalTracks.length > 45}
          onMoreClick={() => {
            /* handle see more */
          }}
          sectionName="top-tracks-global"
          routeTo="/playlist/37i9dQZEVXbMDoHDwVN2tF"
        />
      ) : (
        <SectionLoading
          iconClass="fa-solid fa-arrow-trend-up"
          iconId="trend-icon"
          name=" Sync: Global Top Tracks"
          setPlayerMeta={setPlayerMeta}
          setTrackInfo={setTrackInfo}
        />
      )}
    </>
  );
}
