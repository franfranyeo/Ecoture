import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';
import * as yup from 'yup';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

import AuthLayout from 'components/customer/user/AuthLayout';

function ForgotPassword() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleResendEmail = async () => {
    try {
      await http.post('/user/forgot-password', { email });
      toast.success('Password reset email has been resent!');
    } catch (err) {
      console.error(err);
      toast.error(
        `${
          err.response && err.response.data
            ? err.response.data.message
            : 'Failed to resend the email. Please try again later.'
        }`
      );
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema: yup.object({
      email: yup
        .string()
        .trim()
        .email('Enter a valid email')
        .max(50, 'Email must be at most 50 characters')
        .required('Email is required'),
    }),
    onSubmit: async (data) => {
      data.email = data.email.trim().toLowerCase();
      setEmail(data.email); // Save the email for resending
      try {
        const res = await http.post('/user/forgot-password', data);
        setIsModalOpen(true); // Show modal on successful response
      } catch (err) {
        console.error(err);
        toast.error(
          `${
            err.response && err.response.data
              ? err.response.data.message
              : 'An error occurred'
          }`
        );
      }
    },
  });

  return (
    <AuthLayout title="FORGOT PASSWORD">
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            {/* Container to force alignment */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-start', // Forces alignment to the left
                alignItems: 'center', // Vertically aligns back icon and text
                width: '100%', // Ensures full width
                mb: 2, // Margin below the back button
              }}
            >
              <IconButton
                onClick={() => navigate('/login')}
                sx={{
                  padding: 0, // Removes extra padding from the button
                  mr: 1, // Margin between the icon and text
                }}
              >
                <ArrowBackIosIcon
                  fontSize="small"
                  sx={{ color: 'text.secondary' }}
                />
              </IconButton>
              <Typography
                variant="body2"
                sx={{
                  color: 'text.secondary',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/login')}
              >
                Back
              </Typography>
            </Box>

            {/* Description */}
            <Typography
              variant="body2"
              color="black"
              sx={{
                textAlign: 'center', // Center description
                mb: 3, // Margin below description
              }}
            >
              No worries! Enter your email address below, and we'll send you a
              link to reset your password.
            </Typography>

            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              label="Email Address"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                width: '100%', // Ensure full width of parent
              }}
            />
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{
            mt: 2,
            paddingX: 12,
            fontSize: 16,
            width: '100%',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
            }, // Full width of parent
          }}
        >
          Send Reset Link
        </Button>
      </Box>

      {/* Modal */}
      <Dialog
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        aria-labelledby="check-email-title"
      >
        <DialogTitle id="check-email-title">Check Your Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            We’ve sent a password reset link to your email address. Please check
            your inbox and follow the instructions to reset your password. If
            you don’t see it, check your spam folder or try resending the email.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsModalOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={() => navigate('/login')}
            sx={{
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
              textTransform: 'none',
            }}
            variant="contained"
          >
            GO TO LOGIN
          </Button>
        </DialogActions>
        <Box
          sx={{
            padding: 2,
            textAlign: 'center',
            borderTop: '1px solid #ddd',
          }}
        >
          <Typography variant="body2">
            Didn’t receive an email?{' '}
            <Button variant="text" color="primary" onClick={handleResendEmail}>
              Resend
            </Button>
          </Typography>
        </Box>
      </Dialog>
    </AuthLayout>
  );
}

export default ForgotPassword;
