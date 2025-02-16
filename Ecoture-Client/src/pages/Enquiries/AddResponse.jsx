import { ErrorMessage, Field, Form, Formik } from 'formik';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';
import * as Yup from 'yup';

import { Box, Button, Paper, Typography } from '@mui/material';

// Validation schema using Yup
const validationSchema = Yup.object({
  message: Yup.string().required('Response message is required'),
});

function AddResponse() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleSubmit = (values, { resetForm }) => {
    const newResponse = { message: values.message, enquiryId: id };
    http
      .post('/Response', newResponse)
      .then(() => {
        toast.success('Response added successfully!');
        resetForm();
        navigate('/enquiries');
      })
      .catch((error) => {
        console.error('Error adding response:', error);
        toast.error('Failed to add response. Please try again.');
      });
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#f9f9f9',
        padding: '50px',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: '500px',
          width: '100%',
          padding: '30px',
          borderRadius: '10px',
        }}
      >
        <Typography
          variant="h5"
          sx={{ marginBottom: '20px', textAlign: 'center' }}
        >
          Add Response
        </Typography>
        <Formik
          initialValues={{ message: '' }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              <Box sx={{ marginBottom: '20px' }}>
                <Typography variant="body1" sx={{ marginBottom: '8px' }}>
                  Response Message
                </Typography>
                <Field
                  name="message"
                  as="textarea"
                  rows="4"
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    resize: 'none',
                  }}
                />
                <ErrorMessage
                  name="message"
                  component="div"
                  style={{ color: 'red', marginTop: '5px' }}
                />
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                }}
              >
                <Button
                  type="submit"
                  variant="outlined"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderColor: 'black',
                    color: 'black',
                    ':hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderColor: 'black',
                    },
                  }}
                  disabled={isSubmitting}
                >
                  Add Response
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="primary"
                  sx={{
                    textTransform: 'none',
                    fontSize: '1rem',
                    borderColor: 'black',
                    color: 'red',
                    ':hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)',
                      borderColor: 'black',
                    },
                  }}
                  onClick={() => navigate('/enquiries')}
                >
                  Cancel
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
}

export default AddResponse;
