import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useTheme,
  useMediaQuery
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const TempPage = () => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const navLinks = ['Home', 'About', 'Projects', 'Contact'];

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Cannopux
          </Typography>
          {isMobile ? (
            <>
              <IconButton color="inherit" onClick={handleDrawerToggle}>
                <MenuIcon />
              </IconButton>
              <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerToggle}>
                <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
                  <List>
                    {navLinks.map((text) => (
                      <ListItem button key={text}>
                        <ListItemText primary={text} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </Drawer>
            </>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              {navLinks.map((text) => (
                <Button key={text} color="inherit">
                  {text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>
    </>
  );
};

export default TempPage;
