import "../assets/styles/ArtistMainInfo.css"
import { ArtistFollowersCount, ArtistFollowersCountLoad } from "./ArtistFollowersCount";
import { ArtistProfilePic, ArtistProfilePicLoad } from "../components/ArtistProfilePic.jsx"
import { FollowBtn, FollowBtnLoad } from '../components/FollowBtn.jsx'
import { Skeleton } from "@mui/material";
import { ArtistTrendScore } from "./ArtistTrendScore.jsx";


export function ArtistMainInfo({
    artistName,
    followers,
    trendScore,
    img,
}) {
    return (
        <div className="mainInfo">
            <ArtistProfilePic imgSrc={img} />
            <div className="name-stat">
                <p id="artist-name">{artistName}</p>
                <ArtistFollowersCount count={followers} />
                <ArtistTrendScore trendScore={trendScore} />
                <FollowBtn />
            </div>
            
        </div>
    );
}

export function ArtistMainInfoLoad() {
    return (
        <div className="mainInfo">
           
            <ArtistProfilePicLoad />
        </div>
    );
}
