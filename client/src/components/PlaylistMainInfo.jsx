import "../assets/styles/ArtistMainInfo.css"
import "../assets/styles/PlaylistMainInfo.css"
import {ArtistFollowersCountLoad } from "./ArtistFollowersCount";
import {FollowBtnLoad } from '../components/FollowBtn.jsx'
import { Skeleton } from "@mui/material";
import {PlaylistProfilePic} from "./PlaylistProfilePic.jsx";

export function PlaylistMainInfo({
    PlaylistName,
    description,
    owner,
    img,
}) {
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
