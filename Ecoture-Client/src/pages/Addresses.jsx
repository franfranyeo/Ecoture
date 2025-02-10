import React, { useEffect, useState, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, IconButton, Button, InputAdornment, TextField, Divider } from '@mui/material';
import { AccountCircle, AccessTime, Search, Edit, Clear } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';
import global from '../global';

function Addresses() {
    const [addressList, setAddressList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);
    const { orderId } = useParams();

    // Fetch addresses from the server
    const getAddresses = () => {
        http.get('/address')
            .then((res) => {
                setAddressList(res.data);
            })
            .catch((err) => {
                console.error('Error fetching addresses:', err);
            });
    };

    // Search addresses function
    const searchAddresses = () => {
        http.get(`/address?search=${search}`)
            .then((res) => {
                setAddressList(res.data);
            })
            .catch((err) => {
                console.error('Error searching addresses:', err);
            });
    };

    useEffect(() => {
        getAddresses(); // Fetch addresses on initial load
    }, []);

    // Handle search changes and call the search API
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        if (value.trim()) {
            searchAddresses(); // Fetch search results
        } else {
            getAddresses(); // Re-fetch all addresses if search is cleared
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            searchAddresses();
        }
    };

    const handleSearchClear = () => {
        setSearch('');
        getAddresses();
    };

    return (
        <Box sx={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Title */}
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
                My Addresses
            </Typography>

            {/* Search Bar */}
            <TextField
                value={search}
                onChange={handleSearchChange}
                onKeyDown={handleKeyDown}
                placeholder="Search addresses"
                fullWidth
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Search />
                        </InputAdornment>
                    ),
                    endAdornment: search && (
                        <InputAdornment position="end">
                            <IconButton onClick={handleSearchClear}>
                                <Clear />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 4,
                    maxWidth: '500px',
                    margin: '0 auto',
                    display: 'block',
                }}
            />

            {/* Address List */}
            <Grid container spacing={3}>
                {addressList.map((address) => (
                    <Grid item xs={12} sm={6} md={4} key={address.id}>
                        <Card
                            sx={{
                                display: 'flex',
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                height: '145px',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                                transition: '0.3s',
                                '&:hover': {
                                    transform: 'scale(1.02)',
                                    boxShadow: '0px 6px 15px rgba(0, 0, 0, 0.15)',
                                },
                            }}
                        >
                            {address.imageFile && (
                                <CardMedia
                                    component="img"
                                    sx={{
                                        width: 120,
                                        height: '100%',
                                        objectFit: 'cover',
                                    }}
                                    image={`${import.meta.env.VITE_FILE_BASE_URL}${address.imageFile}`}
                                    alt={address.title}
                                />
                            )}

                            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <CardContent sx={{ padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                        {address.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            mb: 0.5,
                                            fontSize: '0.85rem',
                                            lineHeight: 1.4,
                                        }}
                                    >
                                        {address.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', gap: 1, fontSize: '0.8rem' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccountCircle sx={{ mr: 0.5, fontSize: '16px' }} />
                                            <Typography variant="caption">{address.user?.name}</Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <AccessTime sx={{ mr: 0.5, fontSize: '16px' }} />
                                            <Typography variant="caption">
                                                {dayjs(address.createdAt).format(global.datetimeFormat)}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </CardContent>

                                {/* Edit Button */}
                                {user && user.id === address.userId && (
                                    <Box sx={{ ml: 'auto', mr: 2, mb: 1 }}>
                                        <IconButton
                                            component={Link}
                                            to={`/editaddress/${address.id}`}
                                            sx={{
                                                backgroundColor: 'white',
                                                '&:hover': { backgroundColor: 'lightgray' },
                                                padding: '6px',
                                            }}
                                        >
                                            <Edit color="success" />
                                        </IconButton>
                                    </Box>
                                )}
                            </Box>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Add Address and Add Card Buttons */}
            {user && (
                <Box sx={{ textAlign: 'center', mt: 4, display: 'flex', justifyContent: 'center', gap: '20px' }}>
                    <Button variant="contained" component={Link} to="/addaddress" size="large">
                        Add Address
                    </Button>
                    <Button variant="contained" component={Link} to="/addcreditcard" size="large">
                        Add Card
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default Addresses;
