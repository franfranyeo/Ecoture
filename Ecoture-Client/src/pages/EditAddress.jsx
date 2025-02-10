import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
} from "@mui/material";
import { ArrowBack, Delete } from "@mui/icons-material";
import http from "../utils/http";
import { useFormik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// formating help from ai
function EditAddress() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    title: "",
    description: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    http
      .get(`/address/${id}`)
      .then((res) => {
        setAddress(res.data);
        setImageFile(res.data.imageFile);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to fetch address details.");
        setLoading(false);
      });
  }, [id]);

  const formik = useFormik({
    initialValues: address,
    enableReinitialize: true,
    validationSchema: yup.object({
      title: yup
        .string()
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(100, "Title must be at most 100 characters")
        .required("Title is required"),
      description: yup
        .string()
        .trim()
        .min(3, "Description must be at least 3 characters")
        .max(500, "Description must be at most 500 characters")
        .required("Description is required"),
    }),
    onSubmit: (data) => {
      if (imageFile) {
        data.imageFile = imageFile;
      }
      data.title = data.title.trim();
      data.description = data.description.trim();

      http
        .put(`/address/${id}`, data)
        .then(() => {
          toast.success('Address updated successfully!');
          navigate('/choice');
        })
        .catch(() => {
          toast.error("Failed to update the address.");
        });
    },
  });

  const handleDeleteAddress = () => {
    http
      .delete(`/address/${id}`)
      .then(() => {
        toast.success("Address deleted successfully!");
        navigate("/addresses");
      })
      .catch(() => {
        toast.error("Failed to delete the address.");
      });
  };

  const onFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("Maximum file size is 1MB");
        return;
      }

      const formData = new FormData();
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
        .catch(() => {
          toast.error("Failed to upload image.");
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
          Edit Address
        </Typography>

        {!loading && (
          <Box component="form">
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  margin="dense"
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
                  margin="dense"
                  multiline
                  minRows={4}
                  label="Address Details"
                  name="description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={
                    formik.touched.description &&
                    Boolean(formik.errors.description)
                  }
                  helperText={
                    formik.touched.description && formik.errors.description
                  }
                />
              </Grid>

              {/* Image Upload */}
              <Grid item xs={12} md={6}>
                <Box sx={{ textAlign: "center" }}>
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
                  <Button variant="contained" component="label">
                    Upload Image
                    <input
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={onFileChange}
                    />
                  </Button>
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => setUpdateDialogOpen(true)}
                sx={{ flex: 1, mr: 1 }}
              >
                Update
              </Button>
              <IconButton
                onClick={() => setDeleteDialogOpen(true)}
                color="error"
                sx={{
                  backgroundColor: "#fce4ec",
                  "&:hover": { backgroundColor: "#f8bbd0" },
                }}
              >
                <Delete />
              </IconButton>
            </Box>
          </Box>
        )}

        {/* update */}
        <Dialog
          open={updateDialogOpen}
          onClose={() => setUpdateDialogOpen(false)}
        >
          <DialogTitle>Confirm Update</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to update this address?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setUpdateDialogOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setUpdateDialogOpen(false);
                formik.handleSubmit();
              }}
              variant="contained"
              color="primary"
            >
              Update
            </Button>
          </DialogActions>
        </Dialog>

        {/* delete */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this address? This action cannot
              be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setDeleteDialogOpen(false)}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setDeleteDialogOpen(false);
                handleDeleteAddress();
              }}
              variant="contained"
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Card>

      <ToastContainer />
    </Box>
  );
}

export default EditAddress;
