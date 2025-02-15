import PropTypes from 'prop-types';

import { Box } from '@mui/material';

import Sidebar from './Sidebar';

AdminLayout.propTypes = {
  children: PropTypes.any,
};

const AdminLayout = ({ children }) => (
  <Box sx={{ overflow: 'hidden', display: 'flex' }}>
    <Sidebar />
    <Box
      sx={{
        flexGrow: 1,
        p: 4,
        bgcolor: 'background.default',
        width: '100%',
        overflowY: 'auto',
      }}
    >
      {children}
    </Box>
  </Box>
);

export default AdminLayout;
