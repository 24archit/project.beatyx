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
import { Link } from "react-router-dom"; // Import Link
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import HomeIcon from "@mui/icons-material/Home";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import MusicNoteIcon from "@mui/icons-material/MusicNote";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import InfoIcon from "@mui/icons-material/Info";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import PersonIcon from "@mui/icons-material/Person";
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

  const handleProfileClick = () => {
    console.log("Profile");
    if (open) {
      setOpen(false);
    }
  };
  const handleHomeClick = () => {
    console.log("Home");
    if (open) {
      setOpen(false);
    }
  };
  const handlePlaylistsClick = () => {
    console.log("Your Playlists");
    if (open) {
      setOpen(false);
    }
  };
  const handleSpotifyClick = () => {
    console.log("Connect to Spotify");
    if (open) {
      setOpen(false);
    }
  };
  const handleCreateAIContentClick = () => {
    console.log("Create using AI");
    if (open) {
      setOpen(false);
    }
  };
  const handleAboutUsClick = () => {
    console.log("About Us");
    if (open) {
      setOpen(false);
    }
  };
  const handleContactUsClick = () => {
    console.log("Contact Us");
    if (open) {
      setOpen(false);
    }
  };
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

  const menuItems = [
    {
      text: "Profile",
      icon: <PersonIcon />,
      onClick: handleProfileClick,
      link: "/profile",
    },
    { text: "Home", icon: <HomeIcon />, onClick: handleHomeClick, link: "/" },
    {
      text: "Your Playlists",
      icon: <LibraryMusicIcon />,
      onClick: handlePlaylistsClick,
      link: "/playlists",
    },
    {
      text: "Connect to Spotify",
      icon: <MusicNoteIcon />,
      onClick: handleSpotifyClick,
    },
    {
      text: "Create using AI",
      icon: <LightbulbIcon />,
      onClick: handleCreateAIContentClick,
      link: "/ai",
    },
    {
      text: "About Us",
      icon: <InfoIcon />,
      onClick: handleAboutUsClick,
      link: "/about",
    },
    {
      text: "Contact Us",
      icon: <ContactMailIcon />,
      onClick: handleContactUsClick,
      link: "/contact",
    },
    { text: "Logout", icon: <ExitToAppIcon />, onClick: handleLogoutClick },
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
          <IconButton
            onClick={toggleDrawer}
            sx={{ color: "white" }}
            name="sidebar"
          >
            {open ? (
              <CloseIcon sx={{ color: "white" }} />
            ) : (
              <MenuIcon sx={{ color: "white" }} />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider sx={{ backgroundColor: "white" }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ display: "block" }}>
              {item.link ? (
                <Link
                  to={item.link}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <ListItemButton
                    onClick={item.onClick}
                    sx={{
                      minHeight: 48,
                      justifyContent: open ? "initial" : "center",
                      px: 2.5,
                      color: "white",
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
                </Link>
              ) : (
                <ListItemButton
                  onClick={item.onClick}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    color: "white",
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
              )}
            </ListItem>
          ))}
        </List>
      </Drawer>
    </Box>
  );
}
