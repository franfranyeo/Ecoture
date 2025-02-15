// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';

import EnquiriesDashboard from '../Enquiries/Dashboard';

const Dashboard = () => {
  // const [activeSection, setActiveSection] = useState('Product Management');
  // const navigate = useNavigate();
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h1>Dashboard</h1>
      </Box>
      <EnquiriesDashboard />
    </>
  );
};

export default Dashboard;
