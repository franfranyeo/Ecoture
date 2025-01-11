import React from 'react';
import { Box, Typography, TextField, Button, Grid } from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from 'utils/http';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from 'assets/images/login.png';

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
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                px: 5
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: 'center',
                    gap: { xs: 0, md: 6, lg: 12 },
                    height: '85%',
                    maxHeight: '750px',
                    width: '100%',
                    maxWidth: '1250px'
                }}
            >
                <Box
                    sx={{
                        flex: 1,
                        p: 4,
                        width: '50%',
                        height: '100%',
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        backgroundImage: `url(${loginImage})`, // Keep the same background
                        backgroundSize: 'cover',
                        backgroundPosition: 'center bottom',
                        borderRadius: 3
                    }}
                >
                    <Box>
                        <Typography
                            variant="h3"
                            sx={{ color: 'white', fontWeight: 'bold' }}
                        >
                            UNIQLO
                        </Typography>
                        <Typography
                            variant="h5"
                            sx={{ color: 'white', fontWeight: 'bold' }}
                        >
                            Made for all.
                        </Typography>
                    </Box>
                </Box>

                <Box
                    sx={{
                        width: '50%',
                        display: 'flex',
                        flexDirection: 'column',
                        flex: 1,
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.8)', // Optional: semi-transparent background
                        p: 3,
                        height: '100%',
                        alignItems: 'center'
                    }}
                >
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: '600' }}
                    >
                        FORGOT PASSWORD
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
                                        formik.touched.email &&
                                        formik.errors.email
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
                </Box>
            </Box>
        </Box>
    );
}

export default ForgotPassword;
