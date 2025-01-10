import React, { useContext } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from 'utils/http';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../../../contexts/UserContext';
import GoogleLoginButton from '../../../components/user/GoogleLoginButton';
import loginImage from 'assets/images/login.png';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const formik = useFormik({
        initialValues: {
            email: '',
            password: ''
        },

        validationSchema: yup.object({
            email: yup
                .string()
                .trim()
                .email('Enter a valid email')
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
                )
        }),
        onSubmit: async (data) => {
            data.email = data.email.trim().toLowerCase();
            data.password = data.password.trim();
            try {
                const res = await http.post('/user/login', data);
                // if (res.data.needOtp) {
                //     // Redirect to OTP page if OTP is needed
                //     navigate('/otp-verification', {
                //         state: {
                //             email: data.email,
                //             accessToken: res.data.accessToken
                //         }
                //     });
                // } else {
                //     if (res.data.user.deleteRequested === true) {
                //         // set to false
                //         http.put(`/user/${res.data.user.id}`, {
                //             deleteRequested: false,
                //             deleteRequestedAt: null
                //         });
                //     }
                const user = res.data.user;
                if (user) {
                    user['fullName'] = `${user.firstName} ${user.lastName}`;
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('accessToken', res.data.accessToken);
                } else {
                    console.error('User data is not available');
                }
                setUser(res.data.user);
                toast.success('Logged in successfully');
                navigate('/'); // Navigate to home after login

                // if (
                //     res.data.user.role === 'Admin' ||
                //     res.data.user.role === 'Staff'
                // ) {
                //     navigate('/admin/dashboard'); // Navigate to dashboard for Admin/Staff
                // } else {
                //     navigate('/'); // Navigate to home for Customer
                // }
                // }
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
                height: '100vh',
                px: 5
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    borderRadius: 2,
                    alignItems: 'center',
                    gap: 8,
                    height: '80%',
                    width: '100%'
                }}
            >
                <Box
                    sx={{
                        p: 4,
                        width: '50%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        alignItems: 'flex-end',
                        backgroundImage: `url(${loginImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
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
                        justifyContent: 'center',
                        bgcolor: 'rgba(255, 255, 255, 0.8)', // Optional: semi-transparent background
                        p: 3
                    }}
                >
                    <Box component="form" onSubmit={formik.handleSubmit}>
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                        >
                            {/* <img src={logo} alt="logo" style={{ width: 100 }} /> */}
                        </Box>
                        <Typography
                            variant="h4"
                            align="center"
                            gutterBottom
                            sx={{ fontWeight: '600' }}
                        >
                            WELCOME BACK
                        </Typography>
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
                        </Grid>
                        <Link
                            to="/forgot-password"
                            style={{ textDecoration: 'none' }}
                        >
                            <Typography
                                variant="p"
                                align="right"
                                sx={{
                                    color: 'red',
                                    fontSize: '14px',
                                    mt: 1
                                }}
                            >
                                Forgot Password?
                            </Typography>
                        </Link>
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
                                    width: '100%'
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
                                my: 3 // Margin on Y-axis
                            }}
                        >
                            {/* Left Line */}
                            <Box
                                sx={{
                                    flex: 1,
                                    height: '1px',
                                    backgroundColor: 'grey',
                                    marginRight: 1
                                }}
                            ></Box>

                            {/* Text */}
                            <Typography variant="body2" color="textSecondary">
                                Or login with
                            </Typography>

                            {/* Right Line */}
                            <Box
                                sx={{
                                    flex: 1,
                                    height: '1px',
                                    backgroundColor: 'grey',
                                    marginLeft: 1
                                }}
                            ></Box>
                        </Box>
                        {/* Google Login Button */}
                        <GoogleLoginButton />

                        {/* Footer Links */}
                        <Typography
                            variant="body2"
                            align="center"
                            sx={{ mt: 2, mb: 1 }}
                        >
                            Don’t have an account?{' '}
                            <Link
                                to="/register"
                                style={{ textDecoration: 'none' }}
                            >
                                Register
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}

export default Login;
