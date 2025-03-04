import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';

import { Button } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';

import googleIcon from 'assets/images/google-logo.svg';
import UserContext from 'contexts/UserContext';

function GoogleLoginButton() {
  const navigate = useNavigate();
  const { setUser } = React.useContext(UserContext);
  const [searchParams] = useSearchParams();
  const currentUrl = window.location.pathname;
  const referralCode = searchParams.get('ref');
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Send the access token to the backend
        const res = await http.post('user/google', {
          token: tokenResponse.access_token,
          referralCode: referralCode,
        });
        const { user, accessToken, mfaMethods } = res.data;
        if (user) {
          user['mfaMethods'] = mfaMethods;
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('accessToken', accessToken);
        } else {
          console.error('User data is not available');
        }
        setUser(user);
        toast.success('Logged in successfully');
        navigate('/'); // Navigate to home after login
      } catch (err) {
        console.error('Error logging in:', err);
      }
    },
    onError: (error) => {
      console.error('Google login failed:', error);
    },
  });
  return (
    <Button
      variant="outlined"
      onClick={() => handleGoogleLogin()} // Attach your login logic here
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%', // Full width
        borderColor: 'darkgrey', // Google's blue color
        color: 'grey',
        fontWeight: 'bold',
        textTransform: 'none', // Disable all-uppercase text
        padding: '10px 20px',
        borderRadius: '5px',
        '&:hover': {
          borderColor: 'darkgrey', // Darker blue on hover
          backgroundColor: 'lightgrey', // Light blue background
        },
      }}
    >
      <img
        src={googleIcon}
        alt="Google"
        style={{ width: '20px', marginRight: '10px' }}
      />
      {currentUrl == '/login' ? 'Sign in with Google' : 'Sign up with Google'}
    </Button>
  );
}

export default GoogleLoginButton;
