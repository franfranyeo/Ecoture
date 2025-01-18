// components/Login.jsx
import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from 'components/user/LoginForm';
import MFAVerification from 'components/user/MFAVerification';
import AuthLayout from 'components/user/AuthLayout';
import { authService } from 'services/auth.service';
import { toast } from 'react-toastify';
import UserContext from 'contexts/UserContext';

function Login() {
    const navigate = useNavigate();
    const [showMFA, setShowMFA] = useState(false);
    const [userData, setUserData] = useState(null);
    const { setUser } = useContext(UserContext);

    const handleLoginSuccess = (user, accessToken) => {
        const fullName = `${user.firstName} ${user.lastName}`
            .replace('Empty', '')
            .trim();
        const userToStore = { ...user, fullName };

        setUser(userToStore);
        localStorage.setItem('user', JSON.stringify(userToStore));
        localStorage.setItem('accessToken', accessToken);

        toast.success('Logged in successfully');
        navigate('/');
    };

    const handleLoginSubmit = async (credentials) => {
        try {
            const response = await authService.login(credentials);
            const { user, accessToken } = response;

            if (user.is2FAEnabled) {
                setUserData(user);
                setShowMFA(true);
            } else {
                handleLoginSuccess(user, accessToken);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed');
        }
    };

    const handleMFACancel = () => {
        setShowMFA(false);
        setUserData(null);
    };

    const handleMFASuccess = (user, accessToken) => {
        handleLoginSuccess(user, accessToken);
    };

    return (
        <AuthLayout
            title={showMFA ? 'TWO-FACTOR AUTHENTICATION' : 'WELCOME BACK'}
        >
            {!showMFA ? (
                <LoginForm onSubmit={handleLoginSubmit} />
            ) : (
                <MFAVerification
                    userData={userData}
                    onCancel={handleMFACancel}
                    onSuccess={handleMFASuccess}
                />
            )}
        </AuthLayout>
    );
}

export default Login;
