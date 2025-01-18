import "../assets/styles/ArtistMainInfo.css"
import "../assets/styles/PlaylistMainInfo.css"
import { ArtistFollowersCount, ArtistFollowersCountLoad } from "./ArtistFollowersCount";
import { ArtistProfilePic, ArtistProfilePicLoad } from "../components/ArtistProfilePic.jsx"
import { FollowBtn, FollowBtnLoad } from '../components/FollowBtn.jsx'
import { Skeleton } from "@mui/material";
import spotifyLogo from "../assets/media/Spotify_logo.webp";    
import {PlaylistProfilePic} from "./PlaylistProfilePic.jsx";

export function PlaylistMainInfo({
    PlaylistName,
    description,
    owner,
    img,
}) {
    return (
        <div className="mainInfo">
            <div className="name-stat">
            <p id="artist-name">{PlaylistName}</p>
            <p id="playlist-description">{description}</p>
            </div>
            <PlaylistProfilePic imgSrc={img} />
        </div>
    );
}

export function PlaylistMainInfoLoad() {
    return (
        <div className="mainInfo">
            <div className="name-stat">
                <p><Skeleton sx={{ bgcolor: 'rgba(71, 164, 211, 0.261)', fontSize: '5rem' }} /></p>
                <ArtistFollowersCountLoad />
                <FollowBtnLoad />
            </div>
            <ArtistProfilePicLoad />
        </div>
    );
}
