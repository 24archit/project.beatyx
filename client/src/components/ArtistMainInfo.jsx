import "../assets/styles/ArtistMainInfo.css";
import {
  ArtistFollowersCount,
} from "./ArtistFollowersCount";
import {
  ArtistProfilePic,
  ArtistProfilePicLoad,
} from "../components/ArtistProfilePic.jsx";
import { FollowBtn } from "../components/FollowBtn.jsx";
import { ArtistTrendScore } from "./ArtistTrendScore.jsx";

export function ArtistMainInfo({ artistName, followers, trendScore, img }) {
  return (
    <div className="mainInfo">
      <ArtistProfilePic imgSrc={img} />
      <div className="name-stat">
        <div className="artist-name-container">
          <p id="artist-name">
            {artistName}
          </p>
          </div>
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
