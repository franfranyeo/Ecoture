import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton
} from '@mui/material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from 'utils/http';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation, useNavigate } from 'react-router-dom';
import loginImage from 'assets/images/login.png';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function ResetPassword() {
    const { search } = useLocation();
    const token = new URLSearchParams(search).get('token'); // Assume token is passed as query parameter
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const formik = useFormik({
        initialValues: {
            password: '',
            confirmPassword: ''
        },
        validationSchema: yup.object({
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
                .trim()
                .oneOf([yup.ref('password'), null], 'Passwords must match')
                .required('Confirm password is required')
        }),
        onSubmit: async (data) => {
            setIsLoading(true);
            try {
                const res = await http.post('/user/reset-password', {
                    token,
                    newPassword: data.password
                });
                toast.success(res.data.message);
                navigate('/login');
            } catch (err) {
                toast.error(
                    `${
                        err.response && err.response.data
                            ? err.response.data.message
                            : 'An error occurred'
                    }`
                );
            }
            setIsLoading(false);
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
                        RESET PASSWORD
                    </Typography>
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    type={showPassword ? 'text' : 'password'}
                                    label="New Password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    onBlur={formik.handleBlur}
                                    error={
                                        formik.touched.password &&
                                        Boolean(formik.errors.password)
                                    }
                                    helperText={
                                        formik.touched.password &&
                                        formik.errors.password
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                edge="end"
                                                onClick={
                                                    handleClickShowPassword
                                                }
                                                aria-label="toggle password visibility"
                                                sx={{ color: 'action.active' }}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    type={showPassword ? 'text' : 'password'}
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
                                        formik.touched.confirmPassword &&
                                        formik.errors.confirmPassword
                                    }
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton
                                                edge="end"
                                                onClick={
                                                    handleClickShowPassword
                                                }
                                                aria-label="toggle password visibility"
                                                sx={{ color: 'action.active' }}
                                            >
                                                {showPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
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
                                    backgroundColor: isLoading
                                        ? 'gray'
                                        : 'primary.main'
                                }}
                                disabled={isLoading}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </Button>
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default ResetPassword;
