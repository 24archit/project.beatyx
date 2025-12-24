// client/src/components/Side.jsx
import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Tooltip from "@mui/material/Tooltip"; 
import { Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import HeartIcon from "@mui/icons-material/Favorite";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
import AlbumIcon from "@mui/icons-material/Album";
import HistoryIcon from "@mui/icons-material/History";
import LeftArrowIcon from "@mui/icons-material/ArrowBack";
import RightArrowIcon from "@mui/icons-material/ArrowForward"
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidebar() {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const drawerRef = React.useRef(null);
  const navigate = useNavigate();

  // 1. Get Auth Token
  const authToken = window.localStorage.getItem("authToken");

  const toggleDrawer = () => {
    setOpen(!open);
  };

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (drawerRef.current && !drawerRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoutClick = async (e) => {
    const logoutConfirmed = window.confirm("Are you sure you want to logout?");
    if (!logoutConfirmed) return;
    e.preventDefault();
    try {
      window.localStorage.clear();
      window.location.href = "/";
      e.target.blur();
    } catch (error) {
      console.error(error);
    }
  };

  // 2. Define Menu Items with Auth requirements and Alerts
  const menuItems = [
    {
      text: "Go Back",
      icon: <LeftArrowIcon/>,
      onClick: ()=>navigate(-1),
      link: "#"
    },
    {
      text: "Go Forward",
      icon: <RightArrowIcon/>,
      onClick: ()=>navigate(1),
      link: "#"
    },
    {
      text: "Profile",
      icon: <PersonIcon />,
      onClick: () => setOpen(false),
      link: "/profile",
      authRequired: true,
      alertMsg: "Please sign up or login to view your Profile!"
    },
    {
      text: "Home",
      icon: <HomeIcon />,
      onClick: () => setOpen(false),
      link: "/",
    },
    {
      text: "Liked Songs",
      icon: <HeartIcon />,
      onClick: () => setOpen(false),
      link: "/liked-songs",
      authRequired: true,
      alertMsg: "Please sign up or login to access your Liked Songs!"
    },
   
    {
      text: "Playlists",
      icon: <LibraryMusicIcon />,
      onClick: () => setOpen(false),
      link: "/#",
      authRequired: true,
      alertMsg: "Please sign up or login to access Playlists!"
    },
    {
      text: "Albums",
      icon: <AlbumIcon />,
      onClick: () => setOpen(false),
      link: "/#",
      authRequired: true,
      alertMsg: "Please sign up or login to save and view Albums!"
    },
    
    // {
    //   text: "Listening History",
    //   icon: <HistoryIcon />,
    //   onClick: () => setOpen(false),
    //   link: "/listening-history",
    //   authRequired: true,
    //   alertMsg: "Please sign up or login to view your Listening History!"
    // },
    { 
        text: "Logout", 
        icon: <ExitToAppIcon />, 
        onClick: handleLogoutClick,
        visibleOnlyAuth: true // Flag to show only when logged in
    },
  ];

  return (
    <Box sx={{ display: "flex" }}>
      <Drawer
        ref={drawerRef}
        variant="permanent"
        open={open}
        sx={{
          "& .MuiPaper-root": {
            backgroundColor: "rgba(4, 3, 40, 0.79)",
            color: "white",
          },
        }}
      >
        <DrawerHeader>
          <Tooltip title={open ? "Close Sidebar" : "Open Sidebar"} placement="right">
            <IconButton
              onClick={toggleDrawer}
              sx={{
                color: "white",
                "&:focus, &:focus-visible": {
                  outline: "none",
                  boxShadow: "none",
                },
              }}
            >
              {open ? <CloseIcon /> : <MenuIcon />}
            </IconButton>
          </Tooltip>
        </DrawerHeader>
        <Divider sx={{ backgroundColor: "white" }} />
        <List>
          {menuItems.map((item) => {
            // 3. Logic to hide items (Logout if no token)
            if (item.visibleOnlyAuth && !authToken) return null;

            // 4. Logic to restrict access
            const isRestricted = item.authRequired && !authToken;

            const handleRestrictedClick = () => {
                alert(item.alertMsg || "Please login first!");
            };

            const ButtonContent = (
               <Tooltip title={open ? "" : item.text} placement="right">
                <ListItemButton
                    // If restricted, use the alert handler, otherwise use the item's onClick
                    onClick={isRestricted ? handleRestrictedClick : item.onClick}
                    sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    color: "white",
                    "&:focus, &:focus-visible": {
                        outline: "none",
                        boxShadow: "none",
                    },
                    }}
                >
                    <ListItemIcon
                    sx={{
                        minWidth: 0,
                        justifyContent: "center",
                        mr: open ? 3 : "auto",
                        color: "white",
                    }}
                    >
                    {item.icon}
                    </ListItemIcon>
                    <ListItemText
                    primary={item.text}
                    sx={{ opacity: open ? 1 : 0, color: "white" }}
                    />
                </ListItemButton>
               </Tooltip>
            );

            return (
              <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
                {/* If the item has a link AND the user is allowed (auth present OR not required),
                   we wrap in <Link>.
                   Otherwise (restricted), we render just the button so clicking triggers the alert, not navigation.
                */}
                {item.link && !isRestricted ? (
                  <Link
                    to={item.link}
                    style={{ textDecoration: "none", color: "inherit" }}
                  >
                    {ButtonContent}
                  </Link>
                ) : (
                  ButtonContent
                )}
              </ListItem>
            );
          })}
        </List>
      </Drawer>
    </Box>
  );
}