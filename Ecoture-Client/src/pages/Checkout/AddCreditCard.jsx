import { useFormik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';
import * as yup from 'yup';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from '@mui/material';

// Import card logos
import VisaLogo from '../../assets/images/Visa.png'; // Replace with actual path
import MasterCardLogo from '../../assets/images/mastercard.png'; // Replace with actual path

function AddCreditCard() {
  const navigate = useNavigate();
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [cardType, setCardType] = useState(null);

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
        .matches(/^(4|5)\d{15}$/, 'Card Number must be 16 digits and start with 4 (Visa) or 5 (MasterCard)')
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
      cvv: yup
        .string()
        .matches(/^\d{3}$/, 'CVV must be 3 digits')
        .required('CVV is required'),
    }),
    onSubmit: (data) => {
      http
        .post('/creditcard', data)
        .then(() => {
          navigate('/choice');
        })
        .catch(() => {
          toast.error('An error occurred while adding the credit card. Please try again.');
        });
    },
  });

  // Handle card number change and detect card type
  const handleCardNumberChange = (event) => {
    const { value } = event.target;
    formik.setFieldValue('cardNumber', value);

    if (value.startsWith('4')) {
      setCardType('visa');
    } else if (value.startsWith('5')) {
      setCardType('mastercard');
    } else {
      setCardType(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Add Credit Card
      </Typography>

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

        <Box sx={{ position: 'relative' }}>
          <TextField
            fullWidth
            margin="normal"
            label="Card Number"
            name="cardNumber"
            value={formik.values.cardNumber}
            onChange={handleCardNumberChange}
            onBlur={formik.handleBlur}
            error={formik.touched.cardNumber && Boolean(formik.errors.cardNumber)}
            helperText={formik.touched.cardNumber && formik.errors.cardNumber}
          />
          {cardType && (
            <img
              src={cardType === 'visa' ? VisaLogo : MasterCardLogo}
              alt={`${cardType} logo`}
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

        <Button
          variant="contained"
          onClick={() => setConfirmationOpen(true)}
          sx={{ mt: 3 }}
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Add Card
        </Button>
      </form>

      <Dialog open={confirmationOpen} onClose={() => setConfirmationOpen(false)}>
        <DialogTitle>Confirm Add Credit Card</DialogTitle>
        <DialogContent>
          Are you sure you want to add this credit card?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmationOpen(false)} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              formik.handleSubmit();
              setConfirmationOpen(false);
            }}
            variant="contained"
            color="primary"
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default AddCreditCard;
