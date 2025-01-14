import React, { useState } from 'react';
import {
    Avatar,
    Box,
    Divider,
    Grid,
    IconButton,
    Paper,
    Typography,
    TextField,
    Button
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import { useNavigate } from 'react-router-dom';
import http from 'utils/http';

const EditProfileTab = ({ user }) => {
    const navigate = useNavigate();

    // Initial form data based on user props
    const initialFormData = {
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        mobileNo: user?.mobileNo || '',
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        password: '********' // Masked password
    };

    const [formData, setFormData] = useState(initialFormData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            const res = await http.post('/user/edit-profile', formData);

            if (res.status === 200) {
                alert('Profile updated successfully');
                navigate('/account');
            } else {
                alert('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('An error occurred while saving changes.');
        }
    };

    const handleCancelChanges = () => {
        // Reset the form data to its initial state
        setFormData(initialFormData);
    };

    if (!user) {
        return <Typography>Loading...</Typography>;
    }

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Paper elevation={2} sx={{ padding: 4 }}>
                <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Box display="flex" alignItems="center">
                        <IconButton onClick={() => navigate(-1)}>
                            <ArrowBackIosIcon />
                        </IconButton>
                        <Typography variant="h5" sx={{ ml: 1 }}>
                            Edit Profile
                        </Typography>
                    </Box>
                    <Box>
                        <Button
                            variant="outlined"
                            sx={{ mr: 2 }}
                            onClick={handleCancelChanges}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSaveChanges}
                            sx={{
                                backgroundColor: 'primary.main',
                                '&:hover': {
                                    backgroundColor: 'primary.light'
                                },
                                textTransform: 'none'
                            }}
                        >
                            SAVE CHANGES
                        </Button>
                    </Box>
                </Box>
                <Box
                    display="flex"
                    flexDirection="row"
                    gap={3}
                    mb={4}
                    mt={2}
                    alignItems="center"
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
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Personal Information Section */}
                <Typography variant="h6" gutterBottom>
                    Personal Information
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Mobile Number"
                            name="mobileNo"
                            value={formData.mobileNo}
                            onChange={handleInputChange}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            name="dateOfBirth"
                            type="date"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            InputLabelProps={{
                                shrink: true
                            }}
                        />
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            value={formData.password}
                            InputProps={{
                                readOnly: true
                            }}
                        />
                        <Button
                            onClick={() => navigate('/reset-password')}
                            variant="text"
                            color="primary"
                            sx={{ mt: 1 }}
                        >
                            Change Password
                        </Button>
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

export default EditProfileTab;
