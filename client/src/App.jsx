import "./assets/styles/App.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Player from "./components/Player";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ArtistPage from "./pages/ArtistPage";
import React, { useEffect, useState } from "react";
import SearchPage from "./pages/SearchPage";
import LoadingScreen from "./components/LoadingScreen";
import Side from "./components/Side";
import harmonixAnimation from "../src/assets/media/Animated-Track-Logo.webm";
import PlaylistPage from "./pages/PlaylistPage";
import Footer from "./components/Footer";
function App() {
  const [isAuth, setIsAuth] = useState(false);
  // const [isLoading, setIsLoading] = useState(true);
  const [playerMeta, setPlayerMeta] = useState("");
  const [playerImg, setPlayeImg] = useState(harmonixAnimation);

  useEffect(() => {
    const authToken = window.localStorage.getItem("authToken");
    // setTimeout(() => {
      if (authToken) {
        setIsAuth(true);
      }
      // setIsLoading(false);
    // }, 5000);
  }, []);

  // if (isLoading) {
  //   return (
  //     <>
  //       <LoadingScreen />
  //     </>
  //   );
  // }
  return (
    <Router>
      {isAuth ? (
        <>
          <NavBar isAuth={isAuth} />
          <Side />
          <div className="content">
            <Routes>
              <Route path="/" element={<main><HomePage setPlayerMeta={setPlayerMeta} /></main>}/>
              <Route path="/artist/:id" element={<main><ArtistPage setPlayerMeta={setPlayerMeta} /></main>}/>
              <Route path="/playlist/:id" element={<main><PlaylistPage setPlayerMeta={setPlayerMeta} /></main>}/>
              <Route path="/search" element={<main><SearchPage setPlayerMeta={setPlayerMeta} /></main>}/>
            </Routes>
          </div>
          <Footer/>
          <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
        </>
      ) : (
        <>
          <NavBar isAuth={isAuth} />
          <Side />
          <div className="content">
            <Routes>
              <Route path="/"element={<main><HomePage setPlayerMeta={setPlayerMeta} /></main>}/>
              <Route path="/artist/:id"element={<main> <ArtistPage setPlayerMeta={setPlayerMeta} /></main>}/>
              <Route path="/playlist/:id" element={<main><PlaylistPage  setPlayerMeta={setPlayerMeta}/></main>}/>
              <Route path="/search" element={<main><SearchPage setPlayerMeta={setPlayerMeta} />{" "}</main>}/>
            </Routes>
          </div>
          <Footer/>
          <Player url={playerMeta} setPlayerMeta={setPlayerMeta} />
        </>
      )}
    </Router>
  );
}

export default App;
