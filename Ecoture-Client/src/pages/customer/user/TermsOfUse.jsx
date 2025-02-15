import { Box, Container, Divider, Typography } from '@mui/material';

const TermsOfUse = () => {
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
          Terms of Use
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
          1. Acceptance of Terms
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          By accessing or using our platform, you agree to comply with and be
          bound by these Terms of Use. If you do not agree with these terms,
          please do not use our services.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          2. User Responsibilities
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          You agree to use our platform in a lawful manner and not to engage in
          any activity that may harm or disrupt the platform or its users.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          3. Modifications to Terms
        </Typography>
        <Typography
          variant="body1"
          sx={{
            lineHeight: '1.8',
            marginBottom: '20px',
            color: '#666',
          }}
        >
          We reserve the right to update or modify these Terms of Use at any
          time. Changes will be effective upon posting to the platform.
        </Typography>

        <Typography
          variant="h6"
          sx={{
            fontWeight: '600',
            color: '#444',
            marginBottom: '10px',
          }}
        >
          4. Contact Us
        </Typography>
        <Typography variant="body1" sx={{ lineHeight: '1.8', color: '#666' }}>
          If you have any questions about these terms, please contact us at{' '}
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

export default TermsOfUse;
