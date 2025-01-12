/* eslint-disable react/prop-types */
import {
    Avatar,
    Box,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import React from 'react';

const ProfileTab = ({ user }) => {
    console.log(user);
    return (
        <Box sx={{ flex: 1 }}>
            <Paper elevation={2} sx={{ padding: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography variant="h5">Profile</Typography>
                    <IconButton>
                        <EditIcon />
                    </IconButton>
                </Box>
                <Box
                    display={'flex'}
                    flexDirection={'row'}
                    gap={3}
                    mb={4}
                    mt={2}
                >
                    {user.pfpURL ? (
                        <img
                            src={user.pfpURL}
                            alt="User Avatar"
                            style={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%'
                            }}
                        />
                    ) : (
                        <Avatar sx={{ width: 80, height: 80 }} />
                    )}
                    <Box>
                        <Typography variant="h6">{user.fullName}</Typography>
                        <Typography variant="body2" color="textSecondary">
                            {user.email}
                        </Typography>
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Personal Information Section */}
                <Typography variant="h6" gutterBottom>
                    Personal Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography variant="body1">
                            Name: {user.fullName}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1">
                            Email: {user.email}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1">
                            Phone: {user.mobileNo ? user.mobileNo : 'Not set'}
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body1">
                            Date of Birth:{' '}
                            {user.dateofBirth ? user.dateofBirth : 'Not set'}
                        </Typography>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                {/* Delivery Address Section */}
                <Typography variant="h6" gutterBottom>
                    Delivery Address
                </Typography>
                <Typography variant="body1">
                    123 Main Street, City, Country
                </Typography>
                <Typography variant="body1">Postal Code: 123456</Typography>
            </Paper>
        </Box>
    );
};

export default ProfileTab;
