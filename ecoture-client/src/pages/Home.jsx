import React from 'react';
import {
    Box,
    Typography,
    Button,
    Grid,
    Container,
    TextField
} from '@mui/material';
import mainImage from '../assets/images/home-main-pic.png';
import placeholderImage from '../assets/images/placeholder.jpg';

function Home() {
    return (
        <Box
            sx={{
                fontFamily:
                    'Outfit, system-ui, Avenir, Helvetica, Arial, sans-serif'
            }}
        >
            {/* Hero Section */}
            <Box
                sx={{
                height: '90vh',
                backgroundImage: `url(${mainImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                }}
            >
                {/* Gradient Overlay */}
                <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                    'linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.7))',
                    zIndex: 1,
                }}
                />
                <Box sx={{ zIndex: 2 }}>
                <Typography
                    variant="h2"
                    sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: 'white',
                    letterSpacing: '1px',
                    }}
                >
                    Redefining Elegance
                </Typography>
                <Typography
                    variant="h6"
                    sx={{
                    fontWeight: 300,
                    mb: 4,
                    color: 'white',
                    letterSpacing: '0.5px',
                    }}
                >
                    Discover the perfect balance of style and simplicity.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'white',
                        color: 'black',
                        padding: '10px 20px',
                        fontSize: '16px',
                        fontFamily: 'inherit',
                        '&:hover': { backgroundColor: '#f0f0f0' }
                    }}
                >
                    Shop Now
                </Button>
            </Box>
        </Box>

            {/* Featured Categories */}
            <Container sx={{ mt: 8 }}>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{ mb: 4, fontWeight: 600 }}
                >
                    Shop by Category
                </Typography>
                <Grid container spacing={4}>
                    {['Women', 'Men', 'Accessories'].map((category) => (
                        <Grid item xs={12} sm={4} key={category}>
                            <Box
                                sx={{
                                    height: '300px',
                                    backgroundImage: `url(${placeholderImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    color: 'white',
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    fontFamily: 'inherit',
                                    textShadow: '0px 2px 5px rgba(0,0,0,0.5)',
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0,0,0,0.5)'
                                    }
                                }}
                            >
                                {category}
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Bestsellers */}
            <Container sx={{ mt: 10 }}>
                <Typography
                    variant="h4"
                    align="center"
                    sx={{ mb: 4, fontWeight: 600 }}
                >
                    Bestsellers
                </Typography>
                <Grid container spacing={4}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={3} key={item}>
                            <Box
                                sx={{
                                    height: '300px',
                                    backgroundImage: `url(${placeholderImage})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    borderRadius: '10px',
                                    position: 'relative',
                                    cursor: 'pointer',
                                    '&:hover::after': {
                                        content: '"Quick View"',
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        backgroundColor: 'rgba(0,0,0,0.6)',
                                        color: 'white',
                                        padding: '10px 20px',
                                        borderRadius: '5px',
                                        fontFamily: 'inherit'
                                    }
                                }}
                            ></Box>
                            <Typography
                                variant="body1"
                                align="center"
                                sx={{ mt: 2, fontWeight: 400 }}
                            >
                                Product Name
                            </Typography>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Brand Ethos */}
            <Container sx={{ mt: 10, textAlign: 'center' }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 600 }}>
                    Why Shop With Us?
                </Typography>
                <Grid container spacing={4}>
                    {[
                        { title: 'Sustainably Made', icon: '🌱' },
                        { title: 'Ethically Sourced', icon: '🤝' },
                        { title: 'Fast Shipping', icon: '🚚' }
                    ].map((item) => (
                        <Grid item xs={12} sm={4} key={item.title}>
                            <Box>
                                <Typography
                                    variant="h3"
                                    sx={{ fontFamily: 'inherit' }}
                                >
                                    {item.icon}
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mt: 2,
                                        fontWeight: 400,
                                        fontFamily: 'inherit'
                                    }}
                                >
                                    {item.title}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Newsletter Signup */}
            <Container sx={{ mt: 10, mb: 10, textAlign: 'center' }}>
                <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    Join Our Newsletter
                </Typography>
                <Typography variant="body1" sx={{ mb: 4, fontWeight: 400 }}>
                    Be the first to know about exclusive drops and offers.
                </Typography>
                <TextField
                    placeholder="Enter your email"
                    variant="outlined"
                    sx={{ width: '300px', mr: 2, fontFamily: 'inherit' }}
                />
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: 'black',
                        color: 'white',
                        padding: '10px 20px',
                        fontFamily: 'inherit',
                        '&:hover': { backgroundColor: 'gray' }
                    }}
                >
                    Subscribe
                </Button>
            </Container>

            {/* Footer */}
            <Box
                sx={{
                    backgroundColor: '#000',
                    color: 'white',
                    padding: 3,
                    textAlign: 'center',
                    fontFamily: 'inherit'
                }}
            >
                <Typography variant="body2">
                    © 2025 Ecoture. All Rights Reserved.
                </Typography>
            </Box>
        </Box>
    );
}

export default Home;
