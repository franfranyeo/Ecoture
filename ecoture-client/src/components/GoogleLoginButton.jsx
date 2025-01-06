import React from 'react';
import { Button, Box } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';



function GoogleLoginButton({ onClick }) {
    const icon = '../src/assets/images/google-logo.svg';
    return (
        <Button
            variant="outlined"
            onClick={onClick} // Attach your login logic here
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
                    backgroundColor: 'lightgrey' // Light blue background
                }
            }}
        >
            <img
                src={icon}
                alt="Google"
                style={{ width: '20px', marginRight: '10px' }}
            />
            Sign in with Google
        </Button>
    );
}

export default GoogleLoginButton;
