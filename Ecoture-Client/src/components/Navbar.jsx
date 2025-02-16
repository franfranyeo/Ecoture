import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// Update with the actual image path
import { toast } from 'react-toastify';

import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  Drawer,
  IconButton,
  ListItem,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';

import EcoTureLogo from '../assets/images/ecoture-logo.png';
import UserContext from '../contexts/UserContext';

function Navbar() {
  const { user, setUser } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const adminRoles = [0, 1];

  const customerNavItems = [
    { text: 'New Arrivals', link: 'category/New%20Arrivals' },
    { text: 'Trending', link: 'category/Trending' },
    // temp removed
    { text: 'Women', link: 'category/Women' },
    { text: 'Men', link: 'category/Men' },
    { text: 'Girls', link: 'category/Girls' },
    { text: 'Boys', link: 'category/Boys' },
    //{ text: 'History', link: '/order-history' }
    // { text: "Addresses", link: "/addresses" },
    // { text: "Credit Cards", link: "/creditcards" },
    // { text: "Choice", link: "/choice" },
  ];

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    toast.success('Logged out successfully!');
    handleMenuClose();
    navigate('/login');
  };

  const handleMenuOpen = (event) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    } else {
      navigate('/login');
    }
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigate = (link) => {
    navigate(link);
    handleMenuClose();
  };

  const navItems = adminRoles.includes(user?.role) ? [] : customerNavItems;

  return (
    <AppBar position="relative" sx={{ bgcolor: 'white', boxShadow: 2 }}>
      <Container>
        <Toolbar
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* EcoTure Logo */}
          <Box
            onClick={() => {
              if (['Admin', 'Staff'].includes(user?.role)) {
                // Staff or Admin
                navigate('/admin/dashboard');
              } else {
                // Customer
                navigate('/');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
            }}
          >
            <img
              src={EcoTureLogo}
              alt="EcoTure Logo"
              style={{ width: '90px' }}
            />
          </Box>

          {/* Navigation Links for Desktop */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              gap: '20px',
            }}
          >
            {navItems.map((item, index) => (
              <Link
                className="nav-link"
                sx={{
                  mx: '10px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'all 0.3s',
                  color: '#000',
                  '&:hover': { color: 'red' },
                }}
                to={item.link}
                key={index}
              >
                <Typography
                  sx={{
                    textDecoration: 'none',
                  }}
                >
                  {item.text}
                </Typography>
              </Link>
            ))}
          </Box>

          {/* Mobile Menu Icon */}
          <IconButton
            sx={{ display: { xs: 'block', md: 'none' } }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>

          {/* Profile and Cart Section */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {user && !adminRoles.includes(user?.role) && (
              <Link to="/cart" className="nav-link">
                <ShoppingCartOutlinedIcon />
              </Link>
            )}

            {/* Profile Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              {user && (
                <>
                  {user.pfpURL ? (
                    <img
                      src={user.pfpURL}
                      alt="User Avatar"
                      className="nav-icon avatar-icon"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                      }}
                      onClick={handleMenuOpen}
                    />
                  ) : (
                    <Avatar
                      width="40px"
                      height="40px"
                      sx={{ cursor: 'pointer' }}
                      onClick={handleMenuOpen}
                    />
                  )}
                  {/* <Typography
                    variant="body1"
                    sx={{
                      fontWeight: "500",
                      color: "text.primary",
                      cursor: "pointer",
                      textTransform: "capitalize",
                    }}
                    onClick={handleMenuOpen}
                  >
                    {user.fullName}
                  </Typography> */}

                  {/* Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        borderRadius: 2,
                        minWidth: 200,
                        padding: '8px',
                        bgcolor: 'background.paper',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                      },
                    }}
                  >
                    <Box
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0px 16px 16px 14px',
                        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                      }}
                    >
                      {/* <img
                      src={user.pfpURL}
                      alt="User Avatar"
                      className="nav-icon avatar-icon"
                      style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          marginRight: '8px'
                      }}
                      /> */}
                      {user.pfpURL ? (
                        <img
                          src={user.pfpURL}
                          alt="User Avatar"
                          className="nav-icon avatar-icon"
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                          }}
                        />
                      ) : (
                        <Avatar width="40px" height="40px" />
                      )}
                      <Box style={{ marginLeft: '8px' }}>
                        <Box
                          style={{
                            fontWeight: '500',
                          }}
                        >
                          {user.fullName}
                        </Box>
                        <Box>{user.email}</Box>
                      </Box>
                    </Box>
                    <MenuItem onClick={() => handleNavigate('/account')}>
                      Account
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/order-history')}>
                     Order History
                    </MenuItem>
                    <MenuItem onClick={() => handleNavigate('/refund-requests')}>
                     Refund Status
                    </MenuItem>
                    {adminRoles.includes(user?.role) && (
                      <MenuItem
                        onClick={() => handleNavigate('/admin/settings')}
                      >
                        Admin Settings
                      </MenuItem>
                    )}
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              )}
              {!user && (
                <Box sx={{ display: 'flex' }}>
                  <Link to="/login" className="nav-link">
                    <Button variant="outlined">Login</Button>
                  </Link>

                  <Link to="/register" className="nav-link">
                    <Button
                      variant="contained"
                      sx={{
                        backgroundColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                        },
                        textTransform: 'none',
                      }}
                    >
                      REGISTER
                    </Button>
                  </Link>
                </Box>
              )}
            </div>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer}>
        <Box
          sx={{ width: 250 }}
          role="presentation"
          onClick={toggleDrawer}
          onKeyDown={toggleDrawer}
        >
          {navItems.map((item, index) => (
            <ListItem
              button
              component={Link}
              to={item.link}
              key={index}
              onClick={toggleDrawer}
            >
              <ListItemText primary={item.text} />
            </ListItem>
          ))}
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default Navbar;
