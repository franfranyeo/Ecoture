// components/LoginForm.jsx
import { useFormik } from 'formik';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import * as yup from 'yup';

import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';

import GoogleLoginButton from './GoogleLoginButton';

const validationSchema = yup.object({
  email: yup
    .string()
    .email('Invalid email address')
    .max(50, 'Email must be at most 50 characters')
    .required('Email is required'),
  password: yup
    .string()
    .trim()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required')
    .matches(
      /^(?=.*?[a-zA-Z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      'Password must contain at least 1 letter, 1 number, and 1 special character.'
    ),
});

LoginForm.propTypes = {
  onSubmit: PropTypes.any,
};

function LoginForm({ onSubmit }) {
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        email: values.email.trim().toLowerCase(),
        password: values.password.trim(),
      });
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit}>
      <TextField
        fullWidth
        name="email"
        label="Email"
        value={formik.values.email}
        onChange={formik.handleChange}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        margin="normal"
      />

      <TextField
        fullWidth
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formik.values.password}
        onChange={formik.handleChange}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
        margin="normal"
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={() => setShowPassword(!showPassword)}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          ),
        }}
      />
      <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
        <Typography
          variant="p"
          align="right"
          sx={{
            color: 'red',
            fontSize: '14px',
            mt: 1,
          }}
        >
          Forgot Password?
        </Typography>
      </Link>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Button
          type="submit"
          variant="contained"
          sx={{
            mt: 5,
            paddingX: 12,
            fontSize: 16,
            width: '100%',
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.light',
            },
          }}
        >
          Login
        </Button>
      </Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          my: 3, // Margin on Y-axis
        }}
      >
        <Box
          sx={{
            flex: 1,
            height: '1px',
            backgroundColor: 'grey',
            marginRight: 1,
          }}
        ></Box>
        <Typography variant="body2" color="textSecondary">
          Or login with
        </Typography>
        <Box
          sx={{
            flex: 1,
            height: '1px',
            backgroundColor: 'grey',
            marginLeft: 1,
          }}
        ></Box>
      </Box>

      <GoogleLoginButton />

      <Typography variant="body2" align="center" sx={{ mt: 2, mb: 1 }}>
        Don’t have an account?{' '}
        <Link to="/register" style={{ textDecoration: 'none' }}>
          Register
        </Link>
      </Typography>
    </Box>
  );
}

export default LoginForm;
