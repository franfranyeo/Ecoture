import React from 'react';
import {
    Grid,
    TextField,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Box,
    IconButton
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import registerImage from '../../../assets/images/login.png'; // Adjust the path as needed
import GoogleLoginButton from '../../../components/user/GoogleLoginButton'; // Ensure you have this package installed
import http from 'utils/http';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Register = () => {
    const [showPassword, setShowPassword] = React.useState(false);

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const navigate = useNavigate();
    const formik = useFormik({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false
        },
        validationSchema: yup.object({
            firstName: yup.string().required('Required'),
            lastName: yup.string().required('Required'),
            email: yup
                .string()
                .email('Invalid email address')
                .required('Required'),
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
                .required('Required'),
            agreeToTerms: yup
                .boolean()
                .oneOf([true], 'You must accept the terms and conditions')
        }),
        onSubmit: async (data) => {
            try {
                const res = await http.post('/user/register', data);
                if (res.data) {
                    toast.success('Registration successful!');
                    navigate('/');
                }
            } catch (err) {
                toast.error(err.response.data.message);
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
                        backgroundImage: `url(${registerImage})`, // Keep the same background
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
                        CREATE YOUR ACCOUNT
                    </Typography>
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
                                        formik.touched.firstName &&
                                        Boolean(formik.errors.firstName)
                                    }
                                    helperText={
                                        formik.touched.firstName &&
                                        formik.errors.firstName
                                    }
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
                                    error={
                                        formik.touched.lastName &&
                                        Boolean(formik.errors.lastName)
                                    }
                                    helperText={
                                        formik.touched.lastName &&
                                        formik.errors.lastName
                                    }
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
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    autoComplete="off"
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
                                                to="/terms-of-use"
                                                style={{
                                                    textDecoration: 'none',
                                                    color: '#1976d2'
                                                }}
                                            >
                                                terms of use
                                            </Link>{' '}
                                            and{' '}
                                            <Link
                                                to="/privacy-policy"
                                                style={{
                                                    textDecoration: 'none',
                                                    color: '#1976d2'
                                                }}
                                            >
                                                privacy policy
                                            </Link>
                                            .
                                        </Typography>
                                    }
                                />
                                {formik.touched.agreeToTerms &&
                                    formik.errors.agreeToTerms && (
                                        <Typography
                                            color="error"
                                            variant="body2"
                                            sx={{ mt: 1 }}
                                        >
                                            {formik.errors.agreeToTerms}
                                        </Typography>
                                    )}
                            </Grid>
                        </Grid>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3 }}
                        >
                            Register
                        </Button>

                        {/* Divider with text */}
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
                                Or sign up with
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
                            Already have an account?{' '}
                            <Link
                                to="/login"
                                style={{ textDecoration: 'none' }}
                            >
                                Log In
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default Register;
