import "../assets/styles/SectionName.css";
import { Skeleton } from "@mui/material";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function SectionName({
  iconClass = "",
  iconId = "",
  name = "",
  button = true,
  sectionName,
}){

  const navigate = useNavigate();

  const handleOnClick = () => {
    if (sectionName === "top-tracks-india")
      navigate("/playlist/37i9dQZEVXbLZ52XmnySJg");
    else if (sectionName === "top-tracks-global")
      navigate("/playlist/37i9dQZEVXbMDoHDwVN2tF");
  };

  return (
    <div className="section-name">
      <li>
        <i className={iconClass} id={iconId}></i>
        {name}
      </li>
      {button === true ? (
        <button className="more-btn-home" onClick={handleOnClick}>
          See All
        </button>
      ) : (
        <></>
      )}
    </div>
  );
}

export function SectionNameLoad() {
  return (
    <Skeleton
      variant="rectangular"
      width={700}
      height={30}
      sx={{
        marginLeft: "1rem",
        marginRight: "1rem",
        bgcolor: "rgba(71, 164, 211, 0.261)",
        borderRadius: "1rem",
      }}
    />
  );
}
