import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
// Ensure you have this package installed
import * as yup from 'yup';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Grid,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

import AuthLayout from 'components/customer/user/AuthLayout';
import GoogleLoginButton from 'components/customer/user/GoogleLoginButton';

import { authService } from '../../../services/auth.service';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    },
    validationSchema: yup.object({
      firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(100, 'First name must be at most 100 characters')
        .matches(
          /^[A-Za-z\s'-.,]+$/,
          "Only letters, spaces, and characters: ' - , . are allowed"
        ),
      lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(100, 'Last name must be at most 100 characters')
        .matches(
          /^[A-Za-z\s'-.,]+$/,
          "Only letters, spaces, and characters: ' - , . are allowed"
        ),
      email: yup
        .string()
        .email('Invalid email address')
        .max(50, 'Email must be at most 50 characters')
        .required('Email is required'),
      password: yup
        .string()
        .trim()
        .min(8, 'Password must be at least 8 characters')
        .max(50, 'Password must be at most 50 characters')
        .required('Password is required')
        .matches(
          /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
          'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.'
        ),
      confirmPassword: yup
        .string()
        .oneOf([yup.ref('password'), null], 'Passwords must match')
        .required('Confirm password is required'),
      agreeToTerms: yup
        .boolean()
        .oneOf([true], 'You must accept the terms and conditions'),
    }),
    onSubmit: async (data) => {
      setIsLoading(true);
      try {
        const referralCode = searchParams.get('ref');
        const userData = {
          ...data,
          ...(referralCode && { referralCode }),
        };
        const response = await authService.register(userData);
        if (response) {
          toast.success('Account created successfully');
          navigate('/login');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <AuthLayout title="CREATE YOUR ACCOUNT">
      <Box component="form" onSubmit={formik.handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              type="text"
              label="First Name"
              name="firstName"
              value={formik.values.firstName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.firstName && Boolean(formik.errors.firstName)
              }
              helperText={formik.touched.firstName && formik.errors.firstName}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              type="text"
              label="Last Name"
              name="lastName"
              value={formik.values.lastName}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.lastName && Boolean(formik.errors.lastName)}
              helperText={formik.touched.lastName && formik.errors.lastName}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              type="email"
              label="Email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              type={showPassword ? 'text' : 'password'}
              label="Password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              InputProps={{
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={handleClickShowPassword}
                    aria-label="toggle password visibility"
                    sx={{ color: 'action.active' }}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              margin="dense"
              autoComplete="off"
              type={showConfirmPassword ? 'text' : 'password'}
              label="Confirm Password"
              name="confirmPassword"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.confirmPassword &&
                Boolean(formik.errors.confirmPassword)
              }
              helperText={
                formik.touched.confirmPassword && formik.errors.confirmPassword
              }
              InputProps={{
                endAdornment: (
                  <IconButton
                    edge="end"
                    onClick={handleClickShowConfirmPassword}
                    aria-label="toggle confirm password visibility"
                    sx={{ color: 'action.active' }}
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  name="agreeToTerms"
                  color="primary"
                  checked={formik.values.agreeToTerms}
                  onChange={formik.handleChange}
                />
              }
              label={
                <Typography variant="body2">
                  I agree to the{' '}
                  <Link
                    target="_blank"
                    to="/terms-of-use"
                    style={{
                      textDecoration: 'none',
                      color: '#1976d2',
                    }}
                  >
                    terms of use
                  </Link>{' '}
                  and{' '}
                  <Link
                    target="_blank"
                    to="/privacy-policy"
                    style={{
                      textDecoration: 'none',
                      color: '#1976d2',
                    }}
                  >
                    privacy policy
                  </Link>
                  .
                </Typography>
              }
            />
            {formik.touched.agreeToTerms && formik.errors.agreeToTerms && (
              <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                {formik.errors.agreeToTerms}
              </Typography>
            )}
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ position: 'relative' }}>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{
              mt: 3,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
              },
            }}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: 'grey.300' }} />
            ) : (
              'Register'
            )}
          </Button>
        </Box>

        {/* Divider with text */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            my: 3, // Margin on Y-axis
          }}
        >
          {/* Left Line */}
          <Box
            sx={{
              flex: 1,
              height: '1px',
              backgroundColor: 'grey',
              marginRight: 1,
            }}
          ></Box>

          {/* Text */}
          <Typography variant="body2" color="textSecondary">
            Or sign up with
          </Typography>

          {/* Right Line */}
          <Box
            sx={{
              flex: 1,
              height: '1px',
              backgroundColor: 'grey',
              marginLeft: 1,
            }}
          ></Box>
        </Box>

        {/* Google Login Button */}
        <GoogleLoginButton />

        {/* Footer Links */}
        <Typography variant="body2" align="center" sx={{ mt: 2, mb: 1 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ textDecoration: 'none' }}>
            Log In
          </Link>
        </Typography>
      </Box>
    </AuthLayout>
  );
};

export default Register;
