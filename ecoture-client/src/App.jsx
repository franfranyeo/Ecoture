import {
    Container,
    AppBar,
    Toolbar,
    Typography,
    ThemeProvider,
    Box
} from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import theme from './themes/MyTheme';
import './App.css';
import Login from './pages/customer/user/Login';
import Home from './pages/Home';
import Register from './pages/customer/user/Register';
import TermsOfUse from './pages/customer/user/TermsOfUse';
import PrivacyPolicy from './pages/customer/user/PrivacyPolicy';
import { GoogleOAuthProvider } from '@react-oauth/google';
import UserContext from './contexts/UserContext';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import Account from './pages/customer/user/Account';
import Navbar from './components/Navbar';
import ResetPassword from './pages/customer/user/ResetPassword';
import ForgotPassword from './pages/customer/user/ForgotPassword';
import http from 'utils/http';

function App() {
    // update in the user context too
    const [user, setUser] = useState(null);
    const isFirstLoad = useRef(true); // tracks first load to avoid API call

    // Retrieve user data from localStorage (if available)
    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser) {
            storedUser.fullName = storedUser.fullName
                .split(' ')
                .map((name) => name.charAt(0).toUpperCase() + name.slice(1))
                .join(' ');
            setUser(storedUser);
        }
    }, []);

    // Persist user data in localStorage whenever user state changes
    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            if (isFirstLoad.current) {
                isFirstLoad.current = false; // Skip the first load call
                return; // Don't call the API for the first user set
            }
            try {
                const updateUser = async () => {
                    const res = await http.post(`/user/${user.userId}`, user);
                    console.log(res.data);
                };
                updateUser();
            } catch (err) {
                console.error(err);
            }
        } else {
            localStorage.removeItem('user');
        }
    }, [user]);

    // Use memoization to avoid unnecessary re-renders
    const value = useMemo(() => ({ user, setUser }), [user]);

    return (
        <GoogleOAuthProvider clientId="455480585598-3f0qgcm01cbr2qp4rm9or035u1g75ur8.apps.googleusercontent.com">
            <UserContext.Provider value={value}>
                <Router>
                    <ThemeProvider theme={theme}>
                        <ToastContainer />

                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100vh'
                            }}
                        >
                            <Navbar />
                            <Box sx={{ flex: 1, overflowY: 'auto' }}>
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    <Route path="/login" element={<Login />} />
                                    <Route
                                        path="/register"
                                        element={<Register />}
                                    />
                                    <Route
                                        path="/reset-password"
                                        element={<ResetPassword />}
                                    />
                                    <Route
                                        path="/forgot-password"
                                        element={<ForgotPassword />}
                                    />
                                    <Route
                                        path="/terms-of-use"
                                        element={<TermsOfUse />}
                                    />
                                    <Route
                                        path="/account"
                                        element={<Account />}
                                    />
                                    <Route
                                        path="/privacy-policy"
                                        element={<PrivacyPolicy />}
                                    />
                                </Routes>
                            </Box>
                        </Box>
                    </ThemeProvider>
                </Router>
            </UserContext.Provider>
        </GoogleOAuthProvider>
    );
}

export default App;
