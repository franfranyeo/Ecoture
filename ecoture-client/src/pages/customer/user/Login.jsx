import React, { useContext, useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from 'utils/http';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from 'contexts/UserContext';
import GoogleLoginButton from 'components/user/GoogleLoginButton';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import AuthLayout from 'components/user/AuthLayout';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [showPassword, setShowPassword] = useState(false);
    const [showMFA, setShowMFA] = useState(false);
    const [mfaMethods, setMfaMethods] = useState(null);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [otp, setOtp] = useState('');

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleSelectMethod = (method) => {
        setSelectedMethod(method);
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
                    // check if 2fa is enabled
                    if (user.is2FAEnabled) {
                        // Redirect to OTP page if OTP is needed
                        setShowMFA(true);
                        // fetch user's 2fa methods
                        const res = await http.get('/user/2fa-methods');
                        console.log(res.data);
                        // { sample response
                        //     "sms": true,
                        //     "email": true,
                        //     "authenticator": true
                        // }
                        setMfaMethods(res.data);
                    } else {
                        user['fullName'] = `${user.firstName} ${user.lastName}`;
                        localStorage.setItem('user', JSON.stringify(user));
                        localStorage.setItem(
                            'accessToken',
                            res.data.accessToken
                        );
                    }
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

    const loginForm = (
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
                            formik.touched.email && Boolean(formik.errors.email)
                        }
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
                        error={
                            formik.touched.password &&
                            Boolean(formik.errors.password)
                        }
                        helperText={
                            formik.touched.password && formik.errors.password
                        }
                        InputProps={{
                            endAdornment: (
                                <IconButton
                                    edge="end"
                                    onClick={handleClickShowPassword}
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
            <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
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
            <Typography variant="body2" align="center" sx={{ mt: 2, mb: 1 }}>
                Don’t have an account?{' '}
                <Link to="/register" style={{ textDecoration: 'none' }}>
                    Register
                </Link>
            </Typography>
        </Box>
    );

    // TODO: Implement MFA
    const MFAForm = (
        <Box>
            {!selectedMethod ? (
                <List>
                    {mfaMethods.map((method) => (
                        <ListItem
                            button
                            key={method.type}
                            onClick={() => handleSelectMethod(method)}
                        >
                            <ListItemText primary={method.label} />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Box>
                    <Typography variant="h6">
                        {`Enter the OTP sent via ${selectedMethod}`}
                    </Typography>
                    <TextField
                        label="OTP"
                        fullWidth
                        margin="normal"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                    />
                </Box>
            )}

            {selectedMethod && (
                <Button onClick={() => setSelectedMethod(null)}>Back</Button>
            )}
            <Button>Cancel</Button>
            {selectedMethod && <Button variant="contained">Verify</Button>}
        </Box>
    );

    return (
        <AuthLayout
            title={showMFA ? 'CHOOSE AUTHENTICATION METHOD' : 'WELCOME BACK'}
        >
            {showMFA ? MFAForm : loginForm}
        </AuthLayout>
    );
}

export default Login;
