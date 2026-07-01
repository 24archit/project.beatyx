// client/src/App.jsx
import "./assets/styles/App.css";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route, BrowserRouter as Router, Outlet } from "react-router-dom";

// Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import { Player, CurrentTrackButton, PlayerProvider } from "@/features/player";

// Pages
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import PlaylistPage from "./pages/PlaylistPage";
import AlbumPage from "./pages/AlbumPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import TrackPage from "./pages/TrackPage";
import CategoryPage from "./pages/CategoryPage";
import ProfilePage from "./pages/ProfilePage";
import LikedSongsPage from "./pages/LikedSongsPage";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";

// Context

import { verifyAuth } from "@/features/auth/authService";
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

function Layout({ isAuth, playerMeta, trackInfo, isMobile, isSpotifyConnected }) {
  return (
    <PlayerProvider
      initialUrl={playerMeta}
      initialTrackInfo={trackInfo}
      initialIsAuth={isAuth}
      initialIsSpotifyConnected={isSpotifyConnected}
    >
      <NavBar />
      <div className="content">
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
      {isMobile ? <CurrentTrackButton /> : <Player />}
    </PlayerProvider>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [playerMeta, setPlayerMeta] = useState("");
  const [trackInfo, setTrackInfo] = useState({});
  const [isMobile, setIsMobile] = useState(false);
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false);

  useEffect(() => {
    const authToken = window.localStorage.getItem("authToken");
    const verifyToken = async () => {
      const response = await verifyAuth(authToken);
      if (response.isVerified) {
        setIsAuth(true);
        setIsSpotifyConnected(response.isSpotifyConnect);
      }
    };
    verifyToken();

    // Listen for deep links (e.g. from Spotify auth callback)
    const setupListener = async () => {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (Capacitor.isNativePlatform()) {
          const { App: CapApp } = await import("@capacitor/app");
          const { Browser } = await import("@capacitor/browser");
          CapApp.addListener('appUrlOpen', (data) => {
            if (data.url.includes('beatyx://callback')) {
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

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route
              element={
                <Layout
                  isAuth={isAuth}
                  playerMeta={playerMeta}
                  setPlayerMeta={setPlayerMeta}
                  trackInfo={trackInfo}
                  setTrackInfo={setTrackInfo}
                  isMobile={isMobile}
                  isSpotifyConnected={isSpotifyConnected}
                />
              }
            >
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
                element={<PlaylistPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
              />
              <Route
                path="/album/:id"
                element={<AlbumPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
              />
              <Route
                path="/category/:id"
                element={<CategoryPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
              />
              <Route
                path="/search"
                element={<SearchPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
              />
              <Route
                path="/track/:id" // CHANGED: Added /:id parameter
                element={<TrackPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />}
              />
              <Route
                path="/liked-songs" // Route URL
                element={
                  <LikedSongsPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />
                }
              />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            
            {/* Auth Pages (Outside Layout for clean full-screen view) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
        <Analytics />
        <SpeedInsights />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
