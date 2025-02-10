import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
// formating help from ai for ui
function AddCreditCard() {
  const navigate = useNavigate();
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const formik = useFormik({
    initialValues: {
      cardHolderName: "",
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
    },
    validationSchema: yup.object({
      cardHolderName: yup.string().required("Card Holder Name is required"),
      cardNumber: yup
        .string()
        .matches(/^\d{16}$/, "Card Number must be 16 digits")
        .required("Card Number is required"),
      expiryMonth: yup
        .number()
        .min(1, "Must be between 1 and 12")
        .max(12, "Must be between 1 and 12")
        .required("Expiry Month is required"),
      expiryYear: yup
        .number()
        .min(
          new Date().getFullYear(),
          `Must be ${new Date().getFullYear()} or later`
        )
        .required("Expiry Year is required"),
      cvv: yup
        .string()
        .matches(/^\d{3}$/, "CVV must be 3 digits")
        .required("CVV is required"),
    }),
    onSubmit: (data) => {
      http
        .post("/creditcard", data)
        .then(() => {
          navigate("/creditcards");
        })
        .catch(() => {
          alert(
            "An error occurred while adding the credit card. Please try again."
          );
        });
    },
  });

  const handleConfirm = () => {
    setConfirmationOpen(true);
  };

  const handleClose = () => {
    setConfirmationOpen(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
      >
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
          error={
            formik.touched.cardHolderName &&
            Boolean(formik.errors.cardHolderName)
          }
          helperText={
            formik.touched.cardHolderName && formik.errors.cardHolderName
          }
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
          error={
            formik.touched.expiryMonth && Boolean(formik.errors.expiryMonth)
          }
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
          onClick={handleConfirm}
          sx={{ mt: 3 }}
          disabled={!formik.isValid || formik.isSubmitting}
        >
          Add Card
        </Button>
      </form>

      <Dialog open={confirmationOpen} onClose={handleClose}>
        <DialogTitle>Confirm Add Credit Card</DialogTitle>
        <DialogContent>
          Are you sure you want to add this credit card?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            onClick={() => {
              formik.handleSubmit();
              handleClose();
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
