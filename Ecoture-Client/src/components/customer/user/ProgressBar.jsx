import PropTypes from 'prop-types';

import { LinearProgress } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

ProgressBar.propTypes = {
  totalSpent: PropTypes.any,
  target: PropTypes.any,
};

const ProgressBar = ({ totalSpent, target }) => {
  const progress = Math.min((totalSpent / target) * 100, 100);

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
      >
        <Typography color="textSecondary">Bronze</Typography>
        <Typography color="textSecondary">Silver</Typography>
      </Box>
      <Box sx={{ width: '100%', mt: 2 }}>
        <LinearProgress variant="determinate" value={progress} />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          width: '100%',
          mt: 2,
        }}
      >
        <Typography>$0</Typography>
        <Typography>Your Total Spent: ${totalSpent}</Typography>
        <Typography>${target}</Typography>
      </Box>
    </Box>
  );
};

export default ProgressBar;
