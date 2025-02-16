/* eslint-disable complexity */
import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { formatDateForInput, formatDateForSubmission } from 'utils/helper';
import http from 'utils/http';
import * as yup from 'yup';

import { ArrowBack } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Divider,
  Grid,
  IconButton,
  Paper,
  TextField,
  Typography,
} from '@mui/material';

const custValidationSchema = yup.object().shape({
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
    .nullable(),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Enter a valid email')
    .max(50, "Email can't be longer than 50 characters")
    .required('Email is required'),

  mobileNo: yup.string().trim(),
});

const staffValidationSchema = yup.object().shape({
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
    .nullable(),

  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Enter a valid email')
    .max(50, "Email can't be longer than 50 characters")
    .required('Email is required'),
  mobileNo: yup.string().nullable(),
});

const adminValidationSchema = yup.object().shape({
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
    .nullable(),
  email: yup
    .string()
    .trim()
    .lowercase()
    .email('Enter a valid email')
    .max(50, "Email can't be longer than 50 characters")
    .required('Email is required'),
});

function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    dateofBirth: '',
    email: '',
    mobileNo: '',
  });

  useEffect(() => {
    http.get(`/user/${id}`).then((res) => {
      const cleanedUser = {
        ...res.data,
        dateofBirth: formatDateForInput(res.data.dateofBirth),
        mobileNo: res.data.mobileNo || 'Not set',
      };

      console.log('User fetched:', cleanedUser); // Added logging
      setUser(cleanedUser);
      setLoading(false);
    });
  }, [id]);

  const formik = useFormik({
    initialValues: {
      ...user,
      dateofBirth: user.dateofBirth || '',
    },
    enableReinitialize: true,
    validationSchema:
      user.role === 'Customer'
        ? custValidationSchema
        : user.role === 'Staff'
          ? staffValidationSchema
          : adminValidationSchema,
    onSubmit: async (values) => {
      try {
        const updatedUser = {
          ...values,
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          email: values.email.trim(),
          mobileNo: values.mobileNo ? values.mobileNo : null,
          dateofBirth: formatDateForSubmission(values.dateofBirth),
          pfpURL: user.pfpURL || '',
        };
        const response = await http.put(`/user/${id}`, {
          userId: id,
          ...updatedUser,
        });
        console.log('User updated successfully:', response.data); // Added logging
        toast.success('User updated successfully'); // Optional toast message
        navigate('/admin/users');
      } catch (error) {
        console.error('Error updating user:', error);
        toast.error('Failed to update user');
      }
    },
  });

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton sx={{ cursor: 'pointer' }} onClick={handleCancel}>
          <ArrowBack fontSize="large" />
        </IconButton>
        <Typography variant="h4">Edit User</Typography>
      </Box>

      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: '16px',
          position: 'relative',
        }}
      >
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              mb: 3,
            }}
          >
            <Avatar
              sx={{
                width: 100,
                height: 100,
              }}
              src={user.pfpURL || ''}
              alt={`${user.firstName} ${user.lastName}`}
            />
            <Typography variant="h5" sx={{ mt: 2 }}>
              {user.firstName} {user.lastName}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Personal Information
          </Typography>

          {user.role === 'Customer' && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="First Name"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.firstName &&
                      Boolean(formik.errors.firstName)
                    }
                    helperText={
                      formik.touched.firstName && formik.errors.firstName
                    }
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Last Name"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.lastName && Boolean(formik.errors.lastName)
                    }
                    helperText={
                      formik.touched.lastName && formik.errors.lastName
                    }
                    variant="outlined"
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
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Email Address"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    variant="outlined"
                    disabled={user.isGoogleLogin}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Mobile Number"
                    name="mobileNo"
                    value={formik.values.mobileNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.mobileNo && Boolean(formik.errors.mobileNo)
                    }
                    helperText={
                      formik.touched.mobileNo && formik.errors.mobileNo
                    }
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </>
          )}

          {user.role === 'Admin' && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="First Name"
                  name="firstName"
                  value={formik.values.firstName}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.firstName && Boolean(formik.errors.firstName)
                  }
                  helperText={
                    formik.touched.firstName && formik.errors.firstName
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
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
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  margin="dense"
                  label="Email Address"
                  name="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                  variant="outlined"
                  disabled={user.isGoogleLogin}
                />
              </Grid>
            </Grid>
          )}

          {user.role === 'Staff' && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="First Name"
                    name="firstName"
                    value={formik.values.firstName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.firstName &&
                      Boolean(formik.errors.firstName)
                    }
                    helperText={
                      formik.touched.firstName && formik.errors.firstName
                    }
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Last Name"
                    name="lastName"
                    value={formik.values.lastName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.lastName && Boolean(formik.errors.lastName)
                    }
                    helperText={
                      formik.touched.lastName && formik.errors.lastName
                    }
                    variant="outlined"
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
                    variant="outlined"
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Email Address"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                    variant="outlined"
                    disabled={user.isGoogleLogin}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    type="password"
                    label="Password"
                    name="password"
                    disabled
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.password && Boolean(formik.errors.password)
                    }
                    helperText={
                      formik.touched.password && formik.errors.password
                    }
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    margin="dense"
                    label="Mobile Number"
                    name="mobileNo"
                    value={formik.values.mobileNo}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.mobileNo && Boolean(formik.errors.mobileNo)
                    }
                    helperText={
                      formik.touched.mobileNo && formik.errors.mobileNo
                    }
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </>
          )}

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 2,
            }}
          >
            <Button variant="contained" type="submit" color="primary">
              Update
            </Button>
            <Button variant="outlined" color="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </>
  );
}

export default EditUser;
