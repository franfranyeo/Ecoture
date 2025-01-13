import React, { useContext, useState } from 'react';
import {
    AppBar,
    Toolbar,
    Box,
    Container,
    Menu,
    MenuItem,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    Button,
    Avatar,
    Typography
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import UserContext from '../contexts/UserContext';
import EcoTureLogo from '../assets/images/ecoture-logo.png'; // Update with the actual image path
import { toast } from 'react-toastify';
import MenuIcon from '@mui/icons-material/Menu';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';

function Navbar() {
    const { user, setUser } = useContext(UserContext);
    const [anchorEl, setAnchorEl] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const navigate = useNavigate();

    const navItems = [
        { text: 'New Arrivals', link: '/new-arrivals' },
        { text: 'Trending', link: '/trending' },
        { text: 'Women', link: '/women' },
        { text: 'Men', link: '/men' },
        { text: 'Girls', link: '/girls' },
        { text: 'Boys', link: '/boys' }
    ];

    const handleLogout = () => {
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        toast.success('Logged out successfully!');
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

    return (
        <AppBar position="relative" sx={{ bgcolor: 'white', boxShadow: 2 }}>
            <Container>
                <Toolbar
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    {/* EcoTure Logo */}
                    <Link
                        to="/"
                        style={{ display: 'flex', alignItems: 'center' }}
                    >
                        <img
                            src={EcoTureLogo}
                            alt="EcoTure Logo"
                            style={{ width: '120px' }}
                        />
                    </Link>

                    {/* Navigation Links for Desktop */}
                    <Box
                        sx={{
                            display: { xs: 'none', md: 'flex' },
                            gap: '20px'
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
                                    '&:hover': { color: 'red' }
                                }}
                                to={item.link}
                                key={index}
                            >
                                <Typography
                                    sx={{
                                        textDecoration: 'none'
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
                            gap: '16px'
                        }}
                    >
                        {user && (
                            <Link to="/cart" className="nav-link">
                                <ShoppingCartOutlinedIcon />
                            </Link>
                        )}

                        {/* Profile Section */}
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
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
                                                cursor: 'pointer'
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
                                    {/* Dropdown Menu */}
                                    <Menu
                                        anchorEl={anchorEl}
                                        open={Boolean(anchorEl)}
                                        onClose={handleMenuClose}
                                        MenuListProps={{
                                            'aria-labelledby': 'basic-button'
                                        }}
                                    >
                                        <MenuItem
                                            onClick={() => navigate('/account')}
                                        >
                                            Account
                                        </MenuItem>
                                        <MenuItem onClick={handleLogout}>
                                            Logout
                                        </MenuItem>
                                    </Menu>
                                </>
                            )}
                            {!user && (
                                <Box sx={{ display: 'flex' }}>
                                    <Link to="/login" className="nav-link">
                                        <Button variant="outlined">
                                            Login
                                        </Button>
                                    </Link>

                                    <Link to="/register" className="nav-link">
                                        <Button variant="contained">
                                            Register
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
                    <List>
                        <ListItem button component={Link} to="/new-arrivals">
                            <ListItemText primary="New Arrivals" />
                        </ListItem>
                        <ListItem button component={Link} to="/trending">
                            <ListItemText primary="Trending" />
                        </ListItem>
                        <ListItem button component={Link} to="/women">
                            <ListItemText primary="Women" />
                        </ListItem>
                        <ListItem button component={Link} to="/men">
                            <ListItemText primary="Men" />
                        </ListItem>
                        <ListItem button component={Link} to="/girls">
                            <ListItemText primary="Girls" />
                        </ListItem>
                        <ListItem button component={Link} to="/boys">
                            <ListItemText primary="Boys" />
                        </ListItem>
                    </List>
                </Box>
            </Drawer>
        </AppBar>
    );
}

export default Navbar;
