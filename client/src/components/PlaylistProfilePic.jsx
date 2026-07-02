import "../assets/styles/PlaylistProfilePic.css";
import defaultPlaylistPic from "/playlist-icon.webp";
import { LazyImage } from "./LazyImage.jsx";

export function PlaylistProfilePic({ imgSrc = defaultPlaylistPic }) {
  return <LazyImage src={imgSrc} alt="playlist-profile-pic" className="playlist-pic-lazy" />;
}
