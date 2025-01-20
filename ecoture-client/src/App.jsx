import { ThemeProvider, Box } from '@mui/material';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
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
import Navbar from 'components/Navbar';
import ResetPassword from './pages/customer/user/ResetPassword';
import ForgotPassword from './pages/customer/user/ForgotPassword';
import http from 'utils/http';
import Dashboard from './pages/admin/Dashboard';
import ProtectedRoute from './components/admin/ProtectedRoute';
import Users from './pages/admin/user/Users';
import EditUser from './pages/admin/user/EditUser';
import ViewUser from './pages/admin/user/ViewUser';

function App() {
    // update in the user context too
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
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
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            if (isFirstLoad.current) {
                isFirstLoad.current = false; // Skip the first load call
                return; // Don't call the API for the first user set
            }

            // Detect if a new login occurred
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser?.userId !== user.userId) {
                isFirstLoad.current = true; // Treat this as a new "first load"
                return; // Skip API call for the new login
            }

            try {
                const updateUser = async () => {
                    // Only send the changeable fields to avoid unnecessary updates

                    const updateData = {
                        firstName: user.firstName,
                        lastName: user.lastName,
                        email: user.email,
                        mobileNo: user.mobileNo,
                        dateofBirth: user.dateofBirth,
                        pfpURL: user.pfpURL,
                        is2FAEnabled: user.is2FAEnabled,
                        isEmailVerified: user.isEmailVerified,
                        isPhoneVerified: user.isPhoneVerified,
                        mfaMethods: user.mfaMethods // If you're tracking MFA methods in the user object
                    };

                    const res = await http.post(
                        `/user/edit-profile`,
                        updateData
                    );

                    if (res.data.user) {
                        // Update localStorage with the returned user data
                        const updatedUser = {
                            ...user,
                            ...res.data.user
                        };
                        localStorage.setItem(
                            'user',
                            JSON.stringify(updatedUser)
                        );
                        setLoading(false);
                    }
                };
                updateUser();
            } catch (err) {
                console.error('Failed to update user profile:', err);
            }
        } else {
            localStorage.removeItem('user');
            isFirstLoad.current = true; // Reset the first load tracker
        }
    }, [user]);

    // Use memoization to avoid unnecessary re-renders
    const value = useMemo(() => ({ user, setUser, loading }), [user]);

    const sharedRoutes = [
        {
            url: '/login',
            component: <Login />
        },
        {
            url: '/register',
            component: <Register />
        },
        {
            url: '/reset-password',
            component: <ResetPassword />
        },
        {
            url: '/forgot-password',
            component: <ForgotPassword />
        },
        {
            url: '/terms-of-use',
            component: <TermsOfUse />
        },
        {
            url: '/account',
            component: <Account />
        },
        {
            url: '/privacy-policy',
            component: <PrivacyPolicy />
        },
        {
            url: '/unauthorized',
            component: <h1>Unauthorized</h1>
        }
    ];

    const adminRoutes = [
        {
            url: '/admin/dashboard',
            component: Dashboard
        },
        {
            url: '/admin/users',
            component: Users
        },
        {
            url: '/admin/users/:id/view',
            component: ViewUser
        },
        {
            url: '/admin/users/:id/edit',
            component: EditUser
        }
    ];

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
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto'
                                }}
                            >
                                <Routes>
                                    <Route path="/" element={<Home />} />
                                    {sharedRoutes.map((route, index) => (
                                        <Route
                                            key={index}
                                            path={route.url}
                                            element={route.component}
                                        />
                                    ))}
                                    <Route
                                        path="/admin"
                                        element={
                                            <Navigate to="/admin/dashboard" />
                                        }
                                    />
                                    {adminRoutes.map((route, index) => (
                                        <Route
                                            key={index}
                                            path={route.url}
                                            element={
                                                <ProtectedRoute
                                                    element={route.component}
                                                />
                                            }
                                        />
                                    ))}
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
