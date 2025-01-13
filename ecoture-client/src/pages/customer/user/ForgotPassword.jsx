import React from 'react';
import { Box, TextField, Button, Grid } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from 'utils/http';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthLayout from '../../../components/user/AuthLayout';

function ForgotPassword() {
    const formik = useFormik({
        initialValues: {
            email: ''
        },
        validationSchema: yup.object({
            email: yup
                .string()
                .trim()
                .email('Enter a valid email')
                .max(50, 'Email must be at most 50 characters')
                .required('Email is required')
        }),
        onSubmit: async (data) => {
            data.email = data.email.trim().toLowerCase();
            try {
                const res = await http.post('/user/forgot-password', data);

                toast.success(res.data);
            } catch (err) {
                toast.error(
                    `${
                        err.response && err.response.data
                            ? err.response.data.message
                            : 'An error occurred'
                    }`
                );
            }
        }
    });

    return (
        <AuthLayout title="Forgot Password">
            <Typography variant="body2" color="textSecondary">
                No worries! Enter your email address below, and we'll send you a link to reset your password.
            </Typography>

            <Box component="form" onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            margin="dense"
                            autoComplete="off"
                            label="Email Address"
                            name="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={
                                formik.touched.email &&
                                Boolean(formik.errors.email)
                            }
                            helperText={
                                formik.touched.email && formik.errors.email
                            }
                        />
                    </Grid>
                </Grid>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    sx={{
                        mt: 5
                    }}
                >
                    Send Reset Link
                </Button>
            </Box>
        </AuthLayout>
    );
}

export default ForgotPassword;
