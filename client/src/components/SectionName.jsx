import "../assets/styles/SectionName.css";
import { Skeleton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
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
  const theme = useTheme();

  // You can use breakpoints to set responsive width values
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isSm = useMediaQuery(theme.breakpoints.between("sm", "md"));
  const isMd = useMediaQuery(theme.breakpoints.between("md", "lg"));
  const isLg = useMediaQuery(theme.breakpoints.up("lg"));

  let width;
  if (isXs) width = "90%";
  else if (isSm) width = "80%";
  else if (isMd) width = "70%";
  else width = "60%";

  return (
    <Skeleton
      variant="rectangular"
      width={width}
      height={30}
      sx={{
        marginLeft: "1rem",
        marginRight: "1rem",
        bgcolor: "rgba(71, 164, 211, 0.261)",
        borderRadius: "1rem",
      }}
      className="section-name-load"
    />
  );
}

