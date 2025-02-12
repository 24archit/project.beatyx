import { SpeedInsights } from "@vercel/speed-insights/react";
import { Analytics } from "@vercel/analytics/react";
import "./assets/styles/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import Player from "./components/Player";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import React, { useEffect, useState } from "react";
import SearchPage from "./pages/SearchPage";
import NotFoundPage from "./pages/NotFoundPage";
import Side from "./components/Side";
import harmonixAnimation from "../src/assets/media/Animated-Track-Logo.webm";
import PlaylistPage from "./pages/PlaylistPage";
import Footer from "./components/Footer";
import AlbumPage from "./pages/AlbumPage";

function App() {
  const [isAuth, setIsAuth] = useState(false);

  const [playerMeta, setPlayerMeta] = useState("");
  const [playerImg, setPlayeImg] = useState(harmonixAnimation);

  useEffect(() => {
    const authToken = window.localStorage.getItem("authToken");

    if (authToken) {
      setIsAuth(true);
    }
  }, []);
  // useEffect(() => {
  //   // Disable right-click
  //   const handleContextMenu = (event) => {
  //     event.preventDefault();
  //   };

  //   // Disable specific keyboard shortcuts
  //   const handleKeyDown = (event) => {
  //     if (event.ctrlKey && (event.key === 'u' || event.key === 'U')) {
  //       event.preventDefault();
  //     }
  //     if (event.ctrlKey && event.shiftKey && (event.key === 'I' || event.key === 'C')) {
  //       event.preventDefault();
  //     }
  //     if (event.key === 'F12') {
  //       event.preventDefault();
  //     }
  //   };

  //   // Add event listeners
  //   document.addEventListener('contextmenu', handleContextMenu);
  //   document.addEventListener('keydown', handleKeyDown);

  //   // Cleanup event listeners when component is unmounted
  //   return () => {
  //     document.removeEventListener('contextmenu', handleContextMenu);
  //     document.removeEventListener('keydown', handleKeyDown);
  //   };
  // }, []);

  // if (isLoading) {
  //   return (
  //     <>
  //       <LoadingScreen />
  //     </>
  //   );
  // }

  return (
    <HelmetProvider>
      <>
        <Router>
          <Routes>
            {/* Routes with NavBar, Side, etc. */}
            {isAuth ? (
              <>
                <Route
                  path="/"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <HomePage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                <Route
                  path="/artist/:id"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <ArtistPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                <Route
                  path="/playlist/:id"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <PlaylistPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                 <Route
                  path="/album/:id"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <AlbumPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <SearchPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
              </>
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <HomePage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                <Route
                  path="/artist/:id"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <ArtistPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                <Route
                  path="/playlist/:id"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <PlaylistPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                 <Route
                  path="/album/:id"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <AlbumPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <>
                      <NavBar isAuth={isAuth} />
                      <Side />
                      <div className="content">
                        <main>
                          <SearchPage setPlayerMeta={setPlayerMeta} />
                        </main>
                      </div>
                      <Footer />
                      <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
                    </>
                  }
                />
              </>
            )}

            {/* NotFoundPage Route */}
            <Route
              path="*"
              element={
                <>
                  <NotFoundPage />
                </>
              }
            />
          </Routes>
        </Router>
        <Analytics />
        <SpeedInsights />
      </>
    </HelmetProvider>
  );
}

export default App;
