import "./assets/styles/App.css";
import { useEffect, useState } from "react";
import { HelmetProvider } from "react-helmet-async";
import { Routes, Route, BrowserRouter as Router, Outlet } from "react-router-dom";
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
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import ProfilePage from "./pages/ProfilePage";
import TrackPage from "./pages/TrackPage";

function Layout({ isAuth, playerMeta, setPlayerMeta, trackInfo, setTrackInfo }) {
  return (
    <>
      <NavBar isAuth={isAuth} />
      <Side />
      <div className="content">
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
      <Player
      initialUrl={playerMeta}
      initialTrackInfo={trackInfo}
      />
    </>
  );
}

function App() {
  const [isAuth, setIsAuth] = useState(false);
  const [playerMeta, setPlayerMeta] = useState("");
  const [trackInfo, setTrackInfo] = useState({});

  useEffect(() => {
    const authToken = window.localStorage.getItem("authToken");
    if (authToken) {
      setIsAuth(true);
    }
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <Routes>
          <Route element={<Layout isAuth={isAuth} playerMeta={playerMeta} setPlayerMeta={setPlayerMeta} trackInfo={trackInfo} setTrackInfo={setTrackInfo} />}>
            <Route path="/" element={<HomePage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
            <Route path="/artist/:id" element={<ArtistPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
            <Route path="/playlist/:id" element={<PlaylistPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
            <Route path="/album/:id" element={<AlbumPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
            <Route path="/search" element={<SearchPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
            <Route path="/track" element={<TrackPage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
            <Route path="/profile" element={<ProfilePage setPlayerMeta={setPlayerMeta} setTrackInfo={setTrackInfo} />} />
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
