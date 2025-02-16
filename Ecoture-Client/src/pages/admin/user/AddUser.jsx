import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';
import * as yup from 'yup';

import { ArrowBack } from '@mui/icons-material';
import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

const validationSchema = yup.object().shape({
  firstName: yup
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, "First name can't be longer than 50 characters")
    .required('First name is required'),
  lastName: yup
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, "Last name can't be longer than 50 characters")
    .required('Last name is required'),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Enter a valid email')
    .max(50, "Email can't be longer than 50 characters")
    .required('Email is required'),
  mobileNumber: yup
    .string()
    .matches(/^[0-9]+$/, 'Must be only digits')
    .min(8, 'Must be at least 8 digits')
    .max(15, 'Must be at most 15 digits')
    .nullable(),
  dateofBirth: yup.date().nullable(),
});

// Function to generate a secure random password
const generateSecurePassword = () => {
  const length = 12;
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '#?!@$%^&*-';

  let password =
    uppercase[Math.floor(Math.random() * uppercase.length)] +
    lowercase[Math.floor(Math.random() * lowercase.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    symbols[Math.floor(Math.random() * symbols.length)];

  const allChars = uppercase + lowercase + numbers + symbols;
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

function AddUser() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateofBirth: '',
      mobileNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const generatedPassword = generateSecurePassword();

        // Register request
        const registerRequest = {
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim().toLowerCase(),
          password: generatedPassword,
          role: 'Staff',
          dateofBirth: values.dateofBirth || null,
          mobileNumber: values.mobileNumber || null,
        };

        await http.post('/user/staff', registerRequest);

        toast.success('Staff account created successfully');
        navigate('/admin/users');
      } catch (error) {
        console.error('Error creating staff account:', error);
        toast.error(
          error.response?.data?.errorMessage || 'Failed to create staff account'
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          sx={{ cursor: 'pointer' }}
          onClick={() => navigate('/admin/users')}
        >
          <ArrowBack fontSize="large" />
        </IconButton>
        <Typography variant="h4">Create Staff Account</Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '16px',
        }}
      >
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Staff Information
          </Typography>
          <Divider sx={{ my: 2 }} />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                margin="dense"
                label="First Name"
                name="firstName"
                value={formik.values.firstName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.firstName && Boolean(formik.errors.firstName)
                }
                helperText={formik.touched.firstName && formik.errors.firstName}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                margin="dense"
                label="Last Name"
                name="lastName"
                value={formik.values.lastName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.lastName && Boolean(formik.errors.lastName)
                }
                helperText={formik.touched.lastName && formik.errors.lastName}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                margin="dense"
                label="Email Address"
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                type="date"
                label="Date of Birth"
                name="dateofBirth"
                value={formik.values.dateofBirth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.dateofBirth &&
                  Boolean(formik.errors.dateofBirth)
                }
                helperText={
                  formik.touched.dateofBirth && formik.errors.dateofBirth
                }
                InputLabelProps={{ shrink: true }}
                disabled={isLoading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="dense"
                label="Mobile Number"
                name="mobileNumber"
                value={formik.values.mobileNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.mobileNumber &&
                  Boolean(formik.errors.mobileNumber)
                }
                helperText={
                  formik.touched.mobileNumber && formik.errors.mobileNumber
                }
                disabled={isLoading}
              />
            </Grid>
          </Grid>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 3,
            }}
          >
            <Button
              variant="contained"
              type="submit"
              disabled={isLoading || !formik.isValid || !formik.dirty}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Creating Account...' : 'Create Staff Account'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/admin/users')}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );
}

export default AddUser;
