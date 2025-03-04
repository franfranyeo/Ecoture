import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';
import * as yup from 'yup';

import { ArrowBack } from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Card,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';

// Import flag images
import SingaporeFlag from '../../assets/images/Singapore Flag.png'; // Replace with actual path
import MalaysiaFlag from '../../assets/images/MalaysiaFlag.png'; // Replace with actual path

function AddAddress() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [flag, setFlag] = useState(null); // Holds the flag state

  const formik = useFormik({
    initialValues: {
      title: '',
      description: '',
    },
    validationSchema: yup.object({
      title: yup
        .string()
        .trim()
        .min(3, 'Street Address must be at least 3 characters')
        .max(100, 'Street Address must be at most 100 characters')
        .matches(/^[SM]/, 'Street Address must start with S (Singapore) or M (Malaysia)')
        .required('Street Address is required'),
      description: yup
        .string()
        .trim()
        .min(3, 'Address Details must be at least 3 characters')
        .max(500, 'Address Details must be at most 500 characters')
        .required('Address Details is required'),
    }),
    onSubmit: (data) => {
      if (imageFile) {
        data.imageFile = imageFile;
      }
      data.title = data.title.trim();
      data.description = data.description.trim();
      http
        .post('/address', data)
        .then(() => {
          navigate('/choice');
        })
        .catch((error) => {
          toast.error('An error occurred while adding the address.');
          console.error(error);
        });
    },
  });

  // Handle address input and update flag
  const handleAddressChange = (event) => {
    const { value } = event.target;
    formik.setFieldValue('title', value);

    if (value.startsWith('S')) {
      setFlag(SingaporeFlag);
    } else if (value.startsWith('M')) {
      setFlag(MalaysiaFlag);
    } else {
      setFlag(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      <Card elevation={3} sx={{ padding: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: 'bold', textAlign: 'center' }}
        >
          Add Address
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Box sx={{ position: 'relative' }}>
            <TextField
              fullWidth
              margin="normal"
              label="Street Address"
              name="title"
              value={formik.values.title}
              onChange={handleAddressChange}
              onBlur={formik.handleBlur}
              error={formik.touched.title && Boolean(formik.errors.title)}
              helperText={formik.touched.title && formik.errors.title}
            />
            {flag && (
              <img
                src={flag}
                alt="Country Flag"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  height: '30px',
                }}
              />
            )}
          </Box>

          <TextField
            fullWidth
            margin="normal"
            multiline
            minRows={4}
            label="Address Details"
            name="description"
            value={formik.values.description}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            {imageFile && (
              <Box
                component="img"
                alt="Uploaded Address"
                src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}
                sx={{
                  width: '100%',
                  maxWidth: '200px',
                  height: '150px',
                  objectFit: 'cover',
                  borderRadius: 2,
                  border: '1px solid #ddd',
                  mb: 2,
                }}
              />
            )}
            <Button variant="contained" component="label" sx={{ mb: 1 }}>
              Upload Image
              <input
                hidden
                accept="image/*"
                type="file"
                onChange={(e) => {
                  setUploadError(null);
                  let file = e.target.files[0];
                  if (file) {
                    if (file.size > 1024 * 1024) {
                      setUploadError('Maximum file size is 1MB');
                      return;
                    }

                    let formData = new FormData();
                    formData.append('file', file);
                    http
                      .post('/file/upload', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' },
                      })
                      .then((res) => {
                        setImageFile(res.data.filename);
                        toast.success('Image uploaded successfully.');
                      })
                      .catch((error) => {
                        setUploadError('Failed to upload image.');
                        console.error(error);
                      });
                  }
                }}
              />
            </Button>
            {uploadError && <Alert severity="error">{uploadError}</Alert>}
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ mt: 2, fontWeight: 'bold', fontSize: '1rem' }}
            >
              Upload an image of the place where your package should be
              delivered, in case no one is available to receive it.
            </Typography>
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              type="submit"
              disabled={formik.isSubmitting || !formik.isValid || !imageFile}
            >
              Add Address
            </Button>
          </Box>
        </Box>
      </Card>

      <ToastContainer />
    </Box>
  );
}

export default AddAddress;
