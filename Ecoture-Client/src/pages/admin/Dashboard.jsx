import { useNavigate } from 'react-router-dom';

import { Box, Button } from '@mui/material';

import EnquiriesDashboard from '../Enquiries/Dashboard';

const Dashboard = () => {
  // const [activeSection, setActiveSection] = useState('Product Management');
  const navigate = useNavigate();

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
        <Button
          variant="contained"
          color="success"
          sx={{ height: '40px' }}
          onClick={() => navigate('/addenquiry')}
        >
          Add Enquiry
        </Button>
      </Box>
      <EnquiriesDashboard />
    </>
  );
};

export default Dashboard;
