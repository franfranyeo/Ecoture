import React from 'react';
import {
    Grid,
    TextField,
    Typography,
    Button,
    Checkbox,
    FormControlLabel,
    Box
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import registerImage from '../../../assets/images/login.png'; // Adjust the path as needed
import GoogleLoginButton from '../../../components/user/GoogleLoginButton'; // Ensure you have this package installed
import http from 'utils/http';
import { toast } from 'react-toastify';

const Register = () => {
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
        <Grid container spacing={2} style={{ minHeight: '100vh' }}>
            <Grid
                item
                xs={12}
                md={6}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <img
                    src={registerImage}
                    alt="Register"
                    style={{
                        width: '80%',
                        height: 'auto',
                        borderRadius: '10px'
                    }}
                />
            </Grid>
            <Grid
                item
                xs={12}
                md={6}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <form onSubmit={formik.handleSubmit} style={{ width: '80%' }}>
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                        sx={{ fontWeight: '600' }}
                    >
                        CREATE YOUR ACCOUNT
                    </Typography>
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
                                    formik.touched.email && formik.errors.email
                                }
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="dense"
                                autoComplete="off"
                                type="password"
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
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="dense"
                                autoComplete="off"
                                type="password"
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
                        <Link to="/login" style={{ textDecoration: 'none' }}>
                            Log In
                        </Link>
                    </Typography>
                </form>
            </Grid>
        </Grid>
    );
};

export default Register;
