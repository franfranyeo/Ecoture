import React, { useContext, useEffect, useState } from 'react';
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
import { ArrowForward, Visibility, VisibilityOff } from '@mui/icons-material';
import AuthLayout from 'components/user/AuthLayout';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [showMFA, setShowMFA] = useState(false);
    const [mfaMethods, setMfaMethods] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [otp, setOtp] = useState('');
    const [tempUser, setTempUser] = useState(null);

    const handleClickShowPassword = () => {
        setShowPassword((prev) => !prev);
    };

    const handleCancelClick = () => {
        setShowMFA(false);
        setMfaMethods([]);
        setSelectedMethod(null);
        setOtp('');
        setTempUser(null);
        setLoggedInUser(null);
        // clear formik values
        formik.setValues({ email: '', password: '' });
    };

    const handleSelectMethod = async (method) => {
        setSelectedMethod(method);

        switch (method) {
            case 'email':
                // call API to send OTP to email
                try {
                    const res = await http.post('/verify/email', {
                        email: tempUser.email
                    });
                    if (res.data) {
                        toast.success('OTP sent successfully');
                    } else {
                        toast.error('Failed to send OTP');
                    }
                } catch (err) {
                    toast.error(
                        `${
                            err.response && err.response.data
                                ? err.response.data.message
                                : 'An error occurred'
                        }`
                    );
                }
                break;
            case 'sms':
                // call API to send OTP to mobile number
                try {
                    const res = await http.post('/verify/phone', {
                        email: tempUser.email,
                        phoneNo: tempUser.mobileNo
                    });
                    if (res.data) {
                        toast.success('OTP sent successfully');
                    } else {
                        toast.error('Failed to send OTP');
                    }
                } catch (err) {
                    toast.error(
                        `${
                            err.response && err.response.data
                                ? err.response.data.message
                                : 'An error occurred'
                        }`
                    );
                }
                break;
            default:
                break;
        }
    };

    const handleVerifyOtp = async () => {
        switch (selectedMethod) {
            case 'email':
                // call API to verify OTP
                try {
                    const res = await http.post('/verify/email-otp', {
                        email: tempUser.email,
                        otp
                    });
                    if (res.data) {
                        loggedInUser['fullName'] =
                            `${loggedInUser.firstName} ${loggedInUser.lastName}`.replaceAll(
                                'Empty'
                            );
                        localStorage.setItem(
                            'user',
                            JSON.stringify(loggedInUser)
                        );
                        localStorage.setItem(
                            'accessToken',
                            res.data.accessToken
                        );
                        toast.success('Logged in successfully');
                        setUser(loggedInUser);
                        navigate('/');
                    } else {
                        toast.error('Failed to verify OTP');
                    }
                } catch (err) {
                    toast.error(
                        `${
                            err.response && err.response.data
                                ? err.response.data.message
                                : 'An error occurred'
                        }`
                    );
                }
                break;
            case 'sms':
                // call API to verify OTP
                try {
                    const res = await http.post('/verify/phone-otp', {
                        email: tempUser.email,
                        otp
                    });
                    if (res.data) {
                        loggedInUser['fullName'] =
                            `${loggedInUser.firstName} ${loggedInUser.lastName}`.replaceAll(
                                'Empty'
                            );
                        localStorage.setItem(
                            'user',
                            JSON.stringify(loggedInUser)
                        );
                        localStorage.setItem(
                            'accessToken',
                            res.data.accessToken
                        );
                        setUser(loggedInUser);
                        toast.success('Logged in successfully');

                        navigate('/');
                    } else {
                        toast.error('Failed to verify OTP');
                    }
                } catch (err) {
                    toast.error(
                        `${
                            err.response && err.response.data
                                ? err.response.data.message
                                : 'An error occurred'
                        }`
                    );
                }
                break;
            default:
                break;
        }
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
                const user = res.data.user;
                if (user) {
                    // check if 2fa is enabled
                    if (user.is2FAEnabled) {
                        // Redirect to OTP page if OTP is needed
                        setShowMFA(true);
                        // fetch user's 2fa methods
                        const res = await http.post('/user/get-mfa', {
                            userId: user.userId
                        });
                        const mfaMethods = res.data;
                        console.log(mfaMethods);
                        const activeMfaMethods = Object.keys(mfaMethods).filter(
                            (key) => mfaMethods[key] && key !== 'userId'
                        );

                        setTempUser({
                            userId: user.userId,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            email: user.email,
                            mobileNo: user.mobileNo
                        });

                        setLoggedInUser(user);

                        console.log(activeMfaMethods);
                        setMfaMethods(activeMfaMethods);
                    } else {
                        user['fullName'] =
                            `${user.firstName} ${user.lastName}`.replaceAll(
                                'Empty'
                            );
                        localStorage.setItem('user', JSON.stringify(user));
                        localStorage.setItem(
                            'accessToken',
                            res.data.accessToken
                        );
                        setUser(res.data.user);
                        toast.success('Logged in successfully');
                        navigate('/'); // Navigate to home after login
                    }
                } else {
                    console.error('User data is not available');
                }

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
        <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{
                transition: 'all 0.3s'
            }}
        >
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
    // Automatically select the method if there's only one MFA method
    useEffect(() => {
        if (mfaMethods.length === 1) {
            setSelectedMethod(mfaMethods[0]);
        }
    }, [mfaMethods]);

    const MFAForm = (
        <Box>
            {!selectedMethod ? (
                <List sx={{ borderRadius: '5px', backgroundColor: '#f9f9f9' }}>
                    {mfaMethods.map((method) => (
                        <ListItem
                            key={method}
                            sx={{
                                cursor: 'pointer',
                                border: '1px solid #ddd',
                                borderRadius: '5px',
                                display: 'flex',
                                justifyContent: 'space-between', // To align the arrow on the right
                                padding: '10px',
                                margin: '5px 0',
                                transition:
                                    'background-color 0.3s, box-shadow 0.3s',
                                '&:hover': {
                                    backgroundColor: '#e0f7fa', // Light cyan on hover
                                    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)' // Add shadow effect on hover
                                }
                            }}
                            button
                            onClick={() => handleSelectMethod(method)}
                        >
                            <ListItemText
                                primary={
                                    method === 'email'
                                        ? `Send a verification code to ${tempUser.email}`
                                        : `Send a verification code to ${tempUser.mobileNo.replace(
                                              /^(\+65 )\d{4} (\d{4})$/,
                                              '$1**** $2'
                                          )}`
                                }
                                sx={{
                                    textAlign: 'center',
                                    fontWeight: '500', // Slightly bold text
                                    color: '#333' // Dark color for text
                                }}
                            />
                            <IconButton
                                edge="end"
                                sx={{
                                    color: '#00796b', // Color for the arrow
                                    '&:hover': {
                                        color: '#004d40' // Darker color when hovered
                                    }
                                }}
                            >
                                <ArrowForward />
                            </IconButton>
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
            <Button onClick={handleCancelClick}>Cancel</Button>
            {selectedMethod && (
                <Button variant="contained" onClick={handleVerifyOtp}>
                    Verify
                </Button>
            )}
        </Box>
    );

    return (
        <AuthLayout
            title={showMFA ? 'CHOOSE AUTHENTICATION METHOD' : 'WELCOME BACK'}
        >
            {!showMFA ? loginForm : MFAForm}
        </AuthLayout>
    );
}

export default Login;
