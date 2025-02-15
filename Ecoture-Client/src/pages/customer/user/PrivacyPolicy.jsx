
import { Box, Container, Divider, Typography } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f8f9fa',
        padding: '40px 20px',
      }}
    >
      <Container maxWidth="md">
        <Typography
          variant="h3"
          gutterBottom
          sx={{
            fontWeight: '700',
            textAlign: 'center',
            marginBottom: '20px',
            color: '#333',
          }}
        >
          Privacy Policy
        </Typography>
        <Divider sx={{ marginBottom: '30px', borderColor: '#ddd' }} />

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          1. Information We Collect
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          We collect information you provide to us, such as your name, email
          address, and any other details you enter when signing up or using our
          services.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          2. How We Use Your Information
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          Your information is used to provide, improve, and personalize our
          services, as well as to communicate with you regarding updates and
          promotions.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          3. Sharing Your Information
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          We do not sell your information. However, we may share it with trusted
          third parties for purposes such as payment processing or analytics.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          4. Your Rights
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          You have the right to access, update, or delete your personal
          information. Please contact us if you wish to exercise these rights.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          5. Contact Us
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: '1.8', color: '#666' }}>
          If you have any questions about this privacy policy, please contact us
          at{' '}
          <a
            href="mailto:ecoture.contact.official@gmail.com"
            style={{ color: '#1976d2', textDecoration: 'none' }}
          >
            ecoture.contact.official@gmail.com
          </a>
          .
        </Typography>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
