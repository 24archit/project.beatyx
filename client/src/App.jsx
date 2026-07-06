// client/src/App.jsx
import "./assets/styles/App.css";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route, BrowserRouter as Router, Outlet, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

ReactGA.initialize("G-9HHZDMD7NC");

function RouteTracker() {
  const location = useLocation();

  useEffect(() => {
    ReactGA.send({ hitType: "pageview", page: location.pathname });
  }, [location]);

  return null;
}

// Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";
import SplashScreen from "./components/SplashScreen";
import { Player, CurrentTrackButton, PlayerProvider } from "@/features/player";
import PlaylistDialogs from "@/components/PlaylistDialogs";

// Pages
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import PlaylistPage from "./pages/PlaylistPage";
import AlbumPage from "./pages/AlbumPage";
import QueuePage from "./pages/QueuePage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import TrackPage from "./pages/TrackPage";
import CategoryPage from "./pages/CategoryPage";
import ProfilePage from "./pages/ProfilePage";
import PlaylistsPage from "./pages/PlaylistsPage";
import AlbumsPage from "./pages/AlbumsPage";
import LikedSongsPage from "./pages/LikedSongsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import GoodbyePage from "./pages/GoodbyePage";
import ConcertsPage from "./pages/ConcertsPage";

// Context

import { verifyAuth } from "@/features/auth/authService";
import {
  getTopTracksIndia,
  getTopTracksGlobal,
  getNewReleases,
  getFeaturedPlaylists,
  getTrendingArtists,
  getTrendingArtistsIndia,
} from "@/services/contentService";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Let our standard apiClient handle retries
      refetchOnWindowFocus: false, // Prevent massive request spikes when switching tabs
    },
  },
});

function Layout({ isMobile }) {
  return (
    <>
      <NavBar />
      <PlaylistDialogs />
      <div className="content">
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
      {isMobile ? <CurrentTrackButton /> : <Player />}
    </>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playerMeta, setPlayerMeta] = useState("");
  const [trackInfo, setTrackInfo] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  useEffect(() => {
    const authToken = window.localStorage.getItem("authToken");
    const verifyToken = async () => {
      const [response] = await Promise.all([
        verifyAuth(authToken),
        new Promise((resolve) => setTimeout(resolve, 1800)), // minimum splash duration
      ]);

      if (response?.isVerified) {
        setIsAuth(true);
        setIsSpotifyConnected(response.isSpotifyConnect);
      }

      // Prefetch all home page data into React Query cache during the splash.
      // By the time the user sees the home page, data is already there — no skeletons.
      await Promise.allSettled([
        queryClient.prefetchQuery({
          queryKey: ["featuredPlaylists"],
          queryFn: getFeaturedPlaylists,
        }),
        queryClient.prefetchQuery({ queryKey: ["newReleases"], queryFn: getNewReleases }),
        queryClient.prefetchQuery({ queryKey: ["topIndiaTracks"], queryFn: getTopTracksIndia }),
        queryClient.prefetchQuery({ queryKey: ["topGlobalTracks"], queryFn: getTopTracksGlobal }),
        queryClient.prefetchQuery({ queryKey: ["trendingArtists"], queryFn: getTrendingArtists }),
        queryClient.prefetchQuery({
          queryKey: ["trendingArtistsIndia"],
          queryFn: getTrendingArtistsIndia,
        }),
      ]);

      setIsLoading(false);
    };
    verifyToken();

    // Listen for deep links (e.g. from Spotify auth callback)
    const setupListener = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { App: CapApp } = await import("@capacitor/app");
          const { Browser } = await import("@capacitor/browser");
          CapApp.addListener("appUrlOpen", (data) => {
            if (data.url.includes("beatyx://callback")) {
              Browser.close();
              window.location.reload(); // Reload to fetch updated connection status
            }
          });
        }
        if (Capacitor.isNativePlatform()) {
          // TODO: Native audio implementation will go here
        }
      } catch (e) {
        console.error("Capacitor setup failed:", e);
      }
    };
    setupListener();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <RouteTracker />
          <PlayerProvider
            initialUrl={playerMeta}
            initialTrackInfo={trackInfo}
            initialIsAuth={isAuth}
            initialIsSpotifyConnected={isSpotifyConnected}
          >
            <Routes>
              <Route element={<Layout isMobile={isMobile} />}>
                {/* PASS PROP HERE */}
                <Route
                  path="/"
                  element={
                    <HomePage
                      setPlayerMeta={setPlayerMeta}
                      setTrackInfo={setTrackInfo}
                      isSpotifyConnected={isSpotifyConnected}
                    />
                  }
                />
                <Route
                  path="/artist/:id"
                  element={<ArtistPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
                />
                <Route
                  path="/playlist/:id"
                  element={
                    <PlaylistPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />
                  }
                />
                <Route
                  path="/album/:id"
                  element={<AlbumPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
                />
                <Route
                  path="/category/:id"
                  element={
                    <CategoryPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />
                  }
                />
                <Route
                  path="/search"
                  element={<SearchPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
                />
                <Route
                  path="/track/:id" // CHANGED: Added /:id parameter
                  element={<TrackPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
                />
                <Route element={<ProtectedRoute isAuth={isAuth} isLoading={isLoading} />}>
                  <Route path="/queue" element={<QueuePage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/playlists" element={<PlaylistsPage />} />
                  <Route path="/albums" element={<AlbumsPage />} />
                  <Route
                    path="/liked-songs"
                    element={
                      <LikedSongsPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />
                    }
                  />
                </Route>
                <Route path="/concerts" element={<ConcertsPage />} />
              </Route>

              {/* Auth Pages (Outside Layout for clean full-screen view) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignUpPage />} />

              <Route element={<ProtectedRoute isAuth={isAuth} isLoading={isLoading} />}>
                <Route path="/settings" element={<AccountSettingsPage />} />
              </Route>
              <Route path="/goodbye" element={<GoodbyePage />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </PlayerProvider>
        </Router>
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
