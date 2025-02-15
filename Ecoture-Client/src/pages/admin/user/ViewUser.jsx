import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';

import { ArrowBack, Edit, Lock } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';

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
    timeZone: 'GMT',
  };

  useEffect(() => {
    http.get(`/user/${id}`).then((res) => {
      const cleanedUser = {
        ...res.data,
        dateofBirth: res.data.dateofBirth
          ? res.data.dateofBirth.split('T')[0]
          : 'Not set',
        mobileNumber: res.data.mobileNumber || 'Not set',
        createdAt: new Date(res.data.createdAt).toLocaleDateString(
          'en-US',
          options
        ),
        updatedAt: new Date(res.data.updatedAt).toLocaleDateString(
          'en-US',
          options
        ),
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
        userId: id,
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
          borderRadius: 3,
          position: 'relative',
        }}
      >
        {/* Edit Icon in Top Right Corner */}
        <IconButton
          onClick={handleEdit}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <Edit />
        </IconButton>

        {!loading && user && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                }}
                src={user.pfpURL || ''}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    ml: 3,
                    color: '#333',
                    fontWeight: '500',
                  }}
                >
                  {user.fullName}
                </Typography>
                <Typography
                  variant="body3"
                  color="textSecondary"
                  sx={{ ml: 3 }}
                >
                  {user.role}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box>
              <Typography variant="h6" gutterBottom>
                Personal Information
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>First Name:</strong> {user.firstName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Last Name:</strong> {user.lastName}
                  </Typography>
                </Grid>
                {user.role !== 'Admin' && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body1">
                        <strong>Date of Birth:</strong> {user.dateofBirth}
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
                      <strong>Mobile Number:</strong> {user.mobileNumber}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Referral Code:</strong>{' '}
                    {user.referralCode ? user.referralCode : 'N/A'}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Security Section */}
              <Typography variant="h6" gutterBottom>
                Security
              </Typography>
              <Grid container spacing={2}>
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
                <Grid item xs={6}>
                  <Button startIcon={<Lock />} onClick={handleResetPassword}>
                    Reset Password
                  </Button>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Account Activity Section */}
              <Typography variant="h6" gutterBottom>
                Account Activity
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Created At:</strong> {user.createdAt}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body1">
                    <strong>Updated At:</strong> {user.updatedAt}
                  </Typography>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />
              <Box marginTop={3}>
                <Typography variant="h6" color="error">
                  Delete Account
                </Typography>
                <Typography variant="body2" color="textSecondary" mt={1}>
                  Deleting this account will not delete any of the user data.
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  sx={{ mt: 2 }}
                  onClick={() => handleDelete(user._id)}
                >
                  Delete Account
                </Button>
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
          {'Delete Account?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" sx={{ mb: 2 }}>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
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
