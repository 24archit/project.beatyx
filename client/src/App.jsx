import "./assets/styles/App.css";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import {
  Routes,
  Route,
  BrowserRouter as Router,
  Outlet,
} from "react-router-dom";
import NavBar from "./components/NavBar";
import Side from "./components/Side";
import Footer from "./components/Footer";
import Player from "./components/Player";
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import PlaylistPage from "./pages/PlaylistPage";
import AlbumPage from "./pages/AlbumPage";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import ProfilePage from "./pages/ProfilePage";
import TrackPage from "./pages/TrackPage";
import CurrentTrackButton from "./components/CurrentTrack";
import { PlayerProvider } from "../src/context/PlayerContext";
import { verifyAuth } from "./apis/apiFunctions";

function Layout({
  isAuth,
  playerMeta,
  setPlayerMeta,
  trackInfo,
  setTrackInfo,
  isMobile,
  isSpotifyConnected,
}) {
  return (
    <>
      <PlayerProvider
        initialUrl={playerMeta}
        initialTrackInfo={trackInfo}
        initialIsAuth={isAuth}
        initialIsSpotifyConnected={isSpotifyConnected}
      >
        <NavBar />
        <Side />
        <div className="content">
          <main>
            <Outlet />
          </main>
        </div>
        <Footer />
        {isMobile ? <CurrentTrackButton /> : <Player />}
      </PlayerProvider>
    </>
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
}, []);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const isMobileDevice =
        window.innerWidth <= 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      setIsMobile(isMobileDevice);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <HelmetProvider>
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
            <Route
              path="/"
              element={
                <HomePage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
            <Route
              path="/artist/:id"
              element={
                <ArtistPage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
            <Route
              path="/playlist/:id"
              element={
                <PlaylistPage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
            <Route
              path="/album/:id"
              element={
                <AlbumPage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
            <Route
              path="/search"
              element={
                <SearchPage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
            <Route
              path="/track"
              element={
                <TrackPage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  setPlayerMeta={setPlayerMeta}
                  setTrackInfo={setTrackInfo}
                />
              }
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
      <Analytics />
      <SpeedInsights />
    </HelmetProvider>
  );
}

export default App;
