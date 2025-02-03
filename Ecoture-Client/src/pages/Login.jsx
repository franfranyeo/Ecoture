import React, { useContext } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import { useNavigate, Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserContext from '../contexts/UserContext';

function Login() {
    const navigate = useNavigate();
    const { setUser } = useContext(UserContext);

    const formik = useFormik({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: yup.object({
            email: yup
                .string()
                .email('Enter a valid email')
                .required('Email is required'),
            password: yup.string().required('Password is required'),
        }),
        onSubmit: (data) => {
            http.post('/user/login', data)
                .then((res) => {
                    localStorage.setItem('accessToken', res.data.accessToken);
                    setUser(res.data.user); // Set the user
                    navigate('/'); // Redirect to StaffDashboard
                })
                .catch((err) => {
                    toast.error(err.response?.data?.message || 'Login failed');
                });
        },
    });

    return (
        <Box
            sx={{
                marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="h5" sx={{ my: 2 }}>
                Login
            </Typography>
            <Box
                component="form"
                sx={{ maxWidth: '500px' }}
                onSubmit={formik.handleSubmit}
            >
                <TextField
                    fullWidth
                    margin="dense"
                    autoComplete="off"
                    label="Email"
                    name="email"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.email && Boolean(formik.errors.email)}
                    helperText={formik.touched.email && formik.errors.email}
                />
                <TextField
                    fullWidth
                    margin="dense"
                    autoComplete="off"
                    label="Password"
                    name="password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                />
                <Button fullWidth variant="contained" sx={{ mt: 2 }} type="submit">
                    Login
                </Button>
            </Box>

            <Typography sx={{ mt: 2 }}>
                Do not have an account yet? <Link to="/register">Sign up Here!</Link>
            </Typography>

            <ToastContainer />
        </Box>
    );
}

export default Login;
