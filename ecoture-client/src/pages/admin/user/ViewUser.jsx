import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import http from 'utils/http';
import {
    Box,
    Typography,
    Paper,
    IconButton,
    Grid,
    Avatar,
    Divider,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { ArrowBack, Edit } from '@mui/icons-material';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

function ViewUser() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [userId, setUserId] = useState(null);

    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        timeZone: 'GMT'
    };

    useEffect(() => {
        http.get(`/user/${id}`).then((res) => {
            const cleanedUser = {
                ...res.data,
                dateofBirth: res.data.dateofBirth
                    ? res.data.dateofBirth.split('T')[0]
                    : 'Not set',
                mobileNumber: res.data.mobileNumber || 'Not set',
                fullName: `${res.data.firstName} ${res.data.lastName}`,
                role:
                    res.data.role === 0
                        ? 'Admin'
                        : res.data.role === 1
                        ? 'Staff'
                        : 'Customer',
                createdAt: new Date(res.data.createdAt).toLocaleDateString(
                    'en-US',
                    options
                ),
                updatedAt: new Date(res.data.updatedAt).toLocaleDateString(
                    'en-US',
                    options
                )
            };

            setUser(cleanedUser);
            setLoading(false);
        });
    }, [id]);

    const handleEdit = () => {
        navigate(`/admin/users/${id}/edit`); // Redirect to edit user page
    };

    const handleDelete = (id) => {
        setUserId(id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setUserId(null);
    };

    const deleteUser = async () => {
        if (userId) {
            try {
                await http.delete(`/user/${userId}`);
                toast.success('User deleted successfully');
                navigate('/admin/users');
            } catch (error) {
                console.error('Error deleting user:', error);
                toast.error('Failed to delete user');
            } finally {
                setOpen(false);
                setUserId(null);
            }
        }
    };

    const handleResetPassword = async () => {
        setLoading(true);
        try {
            const response = await http.post('/user/reset-password', {
                userId: id
            });
            toast.success(response.data.message);
        } catch (error) {
            toast.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <IconButton
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate('/admin/users')}
                >
                    <ArrowBack fontSize="large" />
                </IconButton>
                <Typography variant="h4">View User</Typography>
            </Box>
            <Paper
                elevation={3}
                sx={{
                    p: 4,
                    borderRadius: '16px',
                    position: 'relative'
                }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ ml: 2, position: 'absolute', top: 16, right: 16 }}
                    onClick={handleResetPassword}
                >
                    Reset Password
                </Button>

                {!loading && user && (
                    <>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 4
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    boxShadow: 3
                                }}
                                src={user.pfpURL || ''}
                                alt={`${user.firstName} ${user.lastName}`}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    ml: 3,
                                    color: '#333',
                                    fontWeight: '500'
                                }}
                            >
                                {user.firstName} {user.lastName}
                            </Typography>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Box>
                            <Typography
                                variant="h6"
                                gutterBottom
                                sx={{ color: '#555' }}
                            >
                                Basic Information
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>First Name:</strong>{' '}
                                        {user.firstName}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Last Name:</strong>{' '}
                                        {user.lastName}
                                    </Typography>
                                </Grid>
                                {user.role !== 'Admin' && (
                                    <>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body1">
                                                <strong>Date of Birth:</strong>{' '}
                                                {user.dateofBirth}
                                            </Typography>
                                        </Grid>
                                    </>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Email:</strong> {user.email}
                                    </Typography>
                                </Grid>
                                {user.role !== 'Admin' && (
                                    <Grid item xs={12} sm={6}>
                                        <Typography variant="body1">
                                            <strong>Mobile Number:</strong>{' '}
                                            {user.mobileNumber}
                                        </Typography>
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>2FA Enabled:</strong>{' '}
                                        {user.is2FAEnabled ? 'Yes' : 'No'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Email Verified:</strong>{' '}
                                        {user.isEmailVerified ? 'Yes' : 'No'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Phone Verified:</strong>{' '}
                                        {user.isPhoneVerified ? 'Yes' : 'No'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Referral Code:</strong>{' '}
                                        {user.referralCode
                                            ? user.referralCode
                                            : 'N/A'}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Role:</strong> {user.role}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Creation Date:</strong>{' '}
                                        {user.createdAt}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <Typography variant="body1">
                                        <strong>Last updated:</strong>{' '}
                                        {user.updatedAt}
                                    </Typography>
                                </Grid>
                            </Grid>

                            {/* {user.role === 'Customer' && (
                                <>
                                    <Typography
                                        variant="h6"
                                        gutterBottom
                                        sx={{ mt: 4, color: '#555' }}
                                    >
                                        Residential Address
                                    </Typography>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body1">
                                                <strong>Block No.:</strong>{' '}
                                                {user.blockNo}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <Typography variant="body1">
                                                <strong>Unit No.:</strong>{' '}
                                                {user.unitNo}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body1">
                                                <strong>Street Name:</strong>{' '}
                                                {user.streetName}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Typography variant="body1">
                                                <strong>Postal Code:</strong>{' '}
                                                {user.postalCode}
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </>
                            )} */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    mt: 2,
                                    gap: 2
                                }}
                            >
                                {/* // add buttons here */}
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={handleEdit}
                                >
                                    Edit
                                </Button>
                                {user.role !== 'Admin' && (
                                    <Button
                                        variant="contained"
                                        color="error"
                                        onClick={() => handleDelete(user._id)}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </>
                )}
            </Paper>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle
                    id="alert-dialog-title"
                    sx={{ color: '#e2160f', fontWeight: 'bold' }}
                >
                    {'Confirm Delete'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText
                        id="alert-dialog-description"
                        sx={{ mb: 2 }}
                    >
                        Are you sure you want to delete this user? This action
                        cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={handleClose}
                        color="primary"
                        variant="outlined"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={deleteUser}
                        color="error"
                        autoFocus
                        variant="contained"
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default ViewUser;
