import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';
import * as Yup from 'yup';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Paper,
  Typography,
} from '@mui/material';

// Status mapping
const statusEnum = {
  0: 'Open',
  1: 'Closed',
  2: 'In Progress',
};

const reverseStatusEnum = {
  Open: 0,
  Closed: 1,
  'In Progress': 2,
};

// Validation schema
const validationSchema = Yup.object({
  message: Yup.string().required('Response message is required'),
  status: Yup.string().required('Status is required'),
});

function ManageEnquiry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http
      .get(`/Enquiry/${id}`)
      .then((res) => {
        setStatus(statusEnum[res.data.status]); // Convert numeric status to string
        setLoading(false);
      })
      .catch((err) => console.error('Error fetching enquiry:', err));
  }, [id]);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      // Send response message
      await http.post('/Response', { message: values.message, enquiryId: id });

      // Update enquiry status
      await http.put(`/Enquiry/${id}`, { status: reverseStatusEnum[values.status] });

      toast.success('Response added & status updated successfully!');
      navigate('/enquiries');
    } catch (error) {
      console.error('Error updating enquiry:', error);
      toast.error('Failed to update enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', backgroundColor: '#f9f9f9', padding: '50px' }}>
      <Paper elevation={3} sx={{ maxWidth: '500px', width: '100%', padding: '30px', borderRadius: '10px' }}>
        <Typography variant="h5" sx={{ marginBottom: '20px', textAlign: 'center' }}>
          Manage Enquiry
        </Typography>
        <Formik
          initialValues={{ message: '', status }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form>
              {/* Response Message */}
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
                <ErrorMessage name="message" component="div" style={{ color: 'red', marginTop: '5px' }} />
              </Box>

              {/* Enquiry Status */}
              <FormControl fullWidth sx={{ marginBottom: '20px' }}>
                <InputLabel id="status-label">Enquiry Status</InputLabel>
                <Field as={Select} name="status" labelId="status-label">
                  {Object.values(statusEnum).map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Field>
                <ErrorMessage name="status" component="div" style={{ color: 'red', marginTop: '5px' }} />
              </FormControl>

              {/* Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
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
                  Submit
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

export default ManageEnquiry;
