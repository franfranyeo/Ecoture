import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import http from 'utils/http';

import {
  AppBar,
  Box,
  Container,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';

import EcoTureLogo from '../assets/Ecoture6.png';
import ProfileIcon from '../assets/Profile.png';
import ShoppingCartIcon from '../assets/ShoppingCart.png';
import UserContext from '../contexts/UserContext';

import '/navbar.css';

// Ensure you have an HTTP helper

function Navbar({ onLogout }) {
  const { user } = useContext(UserContext);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [cart, setCart] = useState([]); // Manage cart data locally

  //   // Fetch cart data from API
  //   useEffect(() => {
  //     http.get("/cart")
  //         .then((response) => {
  //             setCart(response.data);
  //         })
  //         .catch(() => {
  //             console.error("Failed to fetch cart data");
  //         });
  // }, []); // Empty dependency array ensures this runs once on mount

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

  return (
    <AppBar position="fixed" className="AppBar">
      <Container>
        <Toolbar
          disableGutters
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          {/* EcoTure Logo */}
          <div className="brand-container">
            <Link to="/">
              <img src={EcoTureLogo} alt="EcoTure Logo" className="nav-logo" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="nav-links-container">
            <Link to="/category/New%20Arrivals" className="nav-link">
              New Arrivals
            </Link>
            <Link to="/category/Trending" className="nav-link">
              Trending
            </Link>
            <Link to="/category/Women" className="nav-link">
              Women
            </Link>
            <Link to="/category/Men" className="nav-link">
              Men
            </Link>
            <Link to="/category/Girls" className="nav-link">
              Girls
            </Link>
            <Link to="/category/Boys" className="nav-link">
              Boys
            </Link>
          </div>

          {/* Profile and Cart Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Link to="/cart">
              <img
                src={ShoppingCartIcon}
                alt="Shopping Cart"
                className="nav-icon cart-icon"
              />
              {cart.length > 0 && (
                <span className="cart-count">{cart.length}</span>
              )}
            </Link>

            {/* Profile Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img
                src={ProfileIcon}
                alt="Profile"
                className="nav-icon"
                style={{ cursor: 'pointer' }}
                onClick={handleMenuOpen}
              />
              {user && (
                <>
                  <Typography
                    sx={{
                      color: '#000',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                    }}
                    onClick={handleMenuOpen}
                  >
                    {user.name}
                  </Typography>

                  {/* Dropdown Menu */}
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleMenuClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                  >
                    <MenuItem onClick={onLogout}>Logout</MenuItem>
                  </Menu>
                </>
              )}
            </div>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default Navbar;
