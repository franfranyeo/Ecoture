import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Card,
  Alert,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// formating help from ai for ui and clean up
function AddAddress() {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
    },
    validationSchema: yup.object({
      title: yup
        .string()
        .trim()
        .min(3, "Street Address must be at least 3 characters")
        .max(100, "Street Address must be at most 100 characters")
        .required("Street Address is required"),
      description: yup
        .string()
        .trim()
        .min(3, "Address Details must be at least 3 characters")
        .max(500, "Address Details must be at most 500 characters")
        .required("Address Details is required"),
    }),
    onSubmit: (data) => {
      if (imageFile) {
        data.imageFile = imageFile;
      }
      data.title = data.title.trim();
      data.description = data.description.trim();
      http
        .post("/address", data)
        .then(() => {
          navigate("/addresses");
        })
        .catch((error) => {
          toast.error("An error occurred while adding the address.");
          console.error(error);
        });
    },
  });

  const onFileChange = (e) => {
    setUploadError(null);
    let file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setUploadError("Maximum file size is 1MB");
        return;
      }

      let formData = new FormData();
      formData.append("file", file);
      http
        .post("/file/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setImageFile(res.data.filename);
          toast.success("Image uploaded successfully.");
        })
        .catch((error) => {
          setUploadError("Failed to upload image.");
          console.error(error);
        });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 4 }}>
      <IconButton onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        <ArrowBack />
      </IconButton>

      <Card elevation={3} sx={{ padding: 3 }}>
        <Typography
          variant="h5"
          sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}
        >
          Add Address
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            margin="normal"
            label="Street Address"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.title && Boolean(formik.errors.title)}
            helperText={formik.touched.title && formik.errors.title}
          />

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
            error={
              formik.touched.description && Boolean(formik.errors.description)
            }
            helperText={formik.touched.description && formik.errors.description}
          />

          <Box sx={{ textAlign: "center", mt: 3 }}>
            {imageFile && (
              <Box
                component="img"
                alt="Uploaded Address"
                src={`${import.meta.env.VITE_FILE_BASE_URL}${imageFile}`}
                sx={{
                  width: "100%",
                  maxWidth: "200px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: 2,
                  border: "1px solid #ddd",
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
                onChange={onFileChange}
              />
            </Button>
            {uploadError && <Alert severity="error">{uploadError}</Alert>}
            <Typography
              variant="body1"
              color="text.primary"
              sx={{ mt: 2, fontWeight: "bold", fontSize: "1rem" }}
            >
              Upload an image of the place where your package should be
              delivered, in case no one is available to receive it.
            </Typography>
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 3, textAlign: "center" }}>
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
