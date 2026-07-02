import "../assets/styles/ArtistMainInfo.css";
import "../assets/styles/PlaylistMainInfo.css";
import { PlaylistProfilePic } from "./PlaylistProfilePic.jsx";
export function PlaylistMainInfo({ PlaylistName, description, img }) {
  return (
    <div className="mainInfo-1">
      <PlaylistProfilePic imgSrc={img} />
      <div className="name-stat-1">
        <p id="playlist-name">{PlaylistName}</p>
        <p id="playlist-description">{description}</p>
      </div>
    </div>
  );
}
