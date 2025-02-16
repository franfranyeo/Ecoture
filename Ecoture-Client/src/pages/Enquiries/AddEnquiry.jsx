import { Field, Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';
import * as Yup from 'yup';

import { Box, Button, Container, Paper, TextField, Typography } from '@mui/material';

const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  subject: Yup.string()
    .min(5, 'Subject must be at least 5 characters')
    .required('Subject is required'),
  message: Yup.string()
    .min(10, 'Message must be at least 10 characters')
    .required('Message is required'),
});

function AddEnquiry() {
  const navigate = useNavigate();
  const initialValues = {
    email: '',
    subject: '',
    message: '',
  };

  const handleSubmit = (values, { resetForm }) => {
    const newEnquiry = {
      email: values.email,
      subject: values.subject,
      message: values.message,
    };
    http.post('/Enquiry', newEnquiry).then(() => {
      toast.success('Enquiry added successfully!');
      navigate('/enquiries');
    });
    resetForm();
  };

  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          padding: '30px',
          marginTop: '40px',
          marginBottom: '40px',
          borderRadius: '10px',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
          Submit An Enquiry!
        </Typography>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ errors, touched, isSubmitting }) => (
            <Form>
              <Box sx={{ marginBottom: '20px' }}>
                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
              </Box>
              <Box sx={{ marginBottom: '20px' }}>
                <Field
                  as={TextField}
                  name="subject"
                  label="Subject"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  error={touched.subject && Boolean(errors.subject)}
                  helperText={touched.subject && errors.subject}
                />
              </Box>
              <Box sx={{ marginBottom: '20px' }}>
                <Field
                  as={TextField}
                  name="message"
                  label="Message"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  variant="outlined"
                  error={touched.message && Boolean(errors.message)}
                  helperText={touched.message && errors.message}
                />
              </Box>

              {/* Buttons Section */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontSize: '1rem',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    backgroundColor: '#0A74DA',
                    ':hover': { backgroundColor: '#0858A3' },
                  }}
                  disabled={isSubmitting}
                >
                  Submit
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="error"
                  sx={{
                    textTransform: 'none',
                    fontSize: '1rem',
                    padding: '10px 20px',
                    fontWeight: 'bold',
                    borderColor: '#FF3B30',
                    color: '#FF3B30',
                    ':hover': { backgroundColor: '#FFF0F0', borderColor: '#FF3B30' },
                  }}
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
}

export default AddEnquiry;
