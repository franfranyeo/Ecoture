
import { Box, Typography } from '@mui/material';

import loginImage from 'assets/images/login.png';

const AuthLayout = ({ title, children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        px: 5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          borderRadius: 2,
          alignItems: 'center',
          gap: { xs: 0, md: 6, lg: 12 },
          height: '85%',
          maxHeight: '750px',
          width: '100%',
          maxWidth: '1250px',
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            width: '50%',
            height: '100%',
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'flex-end',
            alignItems: 'flex-end',
            backgroundImage: `url(${loginImage})`, // Keep the same background
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom',
            borderRadius: 3,
          }}
        >
          <Box>
            <Typography
              variant="h3"
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              ECOTURE
            </Typography>
            <Typography
              variant="h5"
              sx={{ color: 'white', fontWeight: 'bold' }}
            >
              Made for all.
            </Typography>
          </Box>
        </Box>
        <Box
          sx={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            bgcolor: 'rgba(255, 255, 255, 0.8)', // Optional: semi-transparent background
            p: 3,
            height: '100%',
            alignItems: 'center',
          }}
        >
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: '600' }}
          >
            {title}
          </Typography>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default AuthLayout;
