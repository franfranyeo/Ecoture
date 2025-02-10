import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress,
  Alert,
  IconButton,
  Card,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as yup from 'yup';
import http from '../http';

// formating help from ai
function EditCreditCard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      cardHolderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
    validationSchema: yup.object({
      cardHolderName: yup.string().required('Card Holder Name is required'),
      cardNumber: yup
        .string()
        .matches(/^\d{16}$/, 'Card Number must be 16 digits')
        .required('Card Number is required'),
      expiryMonth: yup
        .number()
        .min(1, 'Must be between 1 and 12')
        .max(12, 'Must be between 1 and 12')
        .required('Expiry Month is required'),
      expiryYear: yup
        .number()
        .min(new Date().getFullYear(), `Must be ${new Date().getFullYear()} or later`)
        .required('Expiry Year is required'),
      cvv: yup.string().matches(/^\d{3}$/, 'CVV must be 3 digits').required('CVV is required'),
    }),
    onSubmit: (data) => {
      http.put(`/creditcard/${id}`, data)
        .then(() => {
          setUpdateDialogOpen(false);
          navigate('/choice');
        })
        .catch(() => {
          setError('Failed to update the credit card. Please try again.');
        });
    },
  });

  useEffect(() => {
    http.get(`/creditcard/${id}`)
      .then((res) => {
        formik.setValues(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load credit card details.');
        setLoading(false);
      });
  }, [id]);

  const handleDelete = () => {
    http.delete(`/creditcard/${id}`)
      .then(() => {
        setDeleteDialogOpen(false);
        navigate('/creditcards');
      })
      .catch(() => {
        setError('Failed to delete the credit card. Please try again.');
      });
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card elevation={3} sx={{ p: 3 }}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Edit Credit Card
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <form>
              <TextField
                fullWidth
                margin="normal"
                label="Card Holder Name"
                name="cardHolderName"
                value={formik.values.cardHolderName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cardHolderName && Boolean(formik.errors.cardHolderName)}
                helperText={formik.touched.cardHolderName && formik.errors.cardHolderName}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Card Number"
                name="cardNumber"
                value={formik.values.cardNumber}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
                helperText={formik.touched.cardNumber && formik.errors.cardNumber}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Expiry Month"
                name="expiryMonth"
                type="number"
                value={formik.values.expiryMonth}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expiryMonth && Boolean(formik.errors.expiryMonth)}
                helperText={formik.touched.expiryMonth && formik.errors.expiryMonth}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Expiry Year"
                name="expiryYear"
                type="number"
                value={formik.values.expiryYear}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.expiryYear && Boolean(formik.errors.expiryYear)}
                helperText={formik.touched.expiryYear && formik.errors.expiryYear}
              />
              <TextField
                fullWidth
                margin="normal"
                label="CVV"
                name="cvv"
                value={formik.values.cvv}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cvv && Boolean(formik.errors.cvv)}
                helperText={formik.touched.cvv && formik.errors.cvv}
              />

              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setUpdateDialogOpen(true)}
                  disabled={!formik.isValid || formik.isSubmitting}
                >
                  Update
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete
                </Button>
              </Box>
            </form>
          </>
        )}
      </Card>

      {/* update */}
      <Dialog open={updateDialogOpen} onClose={() => setUpdateDialogOpen(false)}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to update this credit card's details?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              formik.handleSubmit();
            }}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* delte */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this credit card? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EditCreditCard;
