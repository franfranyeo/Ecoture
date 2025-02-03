// Address.jsx
import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Grid, Card, CardContent, CardMedia, IconButton, Button, InputAdornment, TextField } from '@mui/material';
import { AccountCircle, AccessTime, Search, Edit, Clear } from '@mui/icons-material';
import http from '../http';
import dayjs from 'dayjs';
import UserContext from '../contexts/UserContext';
import global from '../global';

// formating help from ai, make the ui look abit neater
function Addresses() {
    const [addressList, setAddressList] = useState([]);
    const [search, setSearch] = useState('');
    const { user } = useContext(UserContext);

    // fetch addresses
    const getAddresses = () => {
        http.get('/address')
            .then((res) => {
                setAddressList(res.data);
            })
            .catch((err) => {
                console.error('Error fetching addresses:', err);
            });
    };

    // search addresses,
    const searchAddresses = () => {
        http.get(`/address?search=${search}`)
            .then((res) => {
                setAddressList(res.data);
            })
            .catch((err) => {
                console.error('Error searching addresses:', err);
            });
    };

    // fetch all addresses
    useEffect(() => {
        getAddresses();
    }, []);

    
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearch(value);

        
        if (value.trim()) {
            searchAddresses();
        } else {
            
            getAddresses();
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
        <Box>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                My Addresses
            </Typography>

            
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
                sx={{ mb: 4 }}
            />

            
            <Grid container spacing={3}>
                {addressList.map((address) => (
                    <Grid item xs={12} key={address.id}>
                        <Card
                            sx={{
                                display: 'flex',
                                borderRadius: 2,
                                overflow: 'hidden',
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                height: '145px', 
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

            {/* Add Address Button */}
            {user && (
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Button variant="contained" component={Link} to="/addaddress" size="large">
                        Add Address
                    </Button>
                </Box>
            )}
        </Box>
    );
}

export default Addresses;
