import "../assets/styles/PlaylistProfilePic.css"
import defaultPlaylistPic from "/playlist-icon.webp";
export function PlaylistProfilePic({ imgSrc = defaultPlaylistPic }) {
    return (
        <img src={imgSrc} alt="playlist-profile-pic" id='playlist-pic' loading="lazy" />
    );
}