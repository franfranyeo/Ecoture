import React, { useContext } from 'react';

import { Box } from '@mui/material';

import UserContext from '../contexts/UserContext';

import Products from './Products';

// Import the Products component to display the products

function CustomerLanding() {
  const { user } = useContext(UserContext);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 60px)', // Adjust height to fit below the navbar
        overflowY: 'auto', // Allow vertical scrolling
        paddingTop: '80px', // Account for navbar height
        paddingBottom: '20px', // Add bottom padding to prevent cutoff
        paddingX: '16px', // Horizontal padding for responsiveness
        boxSizing: 'border-box', // Ensure padding is included in the height calculation
      }}
    >
      {/* Welcome Section */}
      {!user && (
        <Box sx={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            Welcome to EcoTure
          </h1>
          <p>Explore our amazing collection of products!</p>
        </Box>
      )}

      {/* Products Section */}
      <Box>
        <Products />
      </Box>
    </Box>
  );
}

export default CustomerLanding;
