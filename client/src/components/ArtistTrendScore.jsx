import { Skeleton } from "@mui/material";
import "../assets/styles/ArtistTrendScore.css";
export function ArtistTrendScore(props) {
  return (
    <>
      <h4 id="artist-trend-score">{`Trend-Score: ${props.trendScore}/100`}</h4>
    </>
  );
}
