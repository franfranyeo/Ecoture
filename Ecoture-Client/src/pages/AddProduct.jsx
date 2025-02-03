import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardActions,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
  Chip,
} from "@mui/material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AddProduct() {
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [sizes, setSizes] = useState([{ sizeName: "", stockQuantity: "" }]);
  const [colors, setColors] = useState([]);
  const [colorInput, setColorInput] = useState("");

  const formik = useFormik({
    initialValues: {
      title: "",
      description: "",
      longDescription: "",
      price: "",
      categoryName: "",
      fit: "",
    },
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
      longDescription: yup
        .string()
        .trim()
        .min(3, "Long description must be at least 3 characters")
        .max(1000, "Long description must be at most 1000 characters")
        .required("Long description is required"),
      price: yup
        .number()
        .min(0.01, "Price must be greater than zero")
        .required("Price is required"),
      categoryName: yup.string().required("Category is required"),
      fit: yup.string().required("Fit is required"),
      sizes: yup.array().of(
        yup.object().shape({
          sizeName: yup.string().trim().required("Size name is required"),
          stockQuantity: yup
            .number()
            .min(1, "Stock quantity must be at least 1")
            .required("Stock quantity is required"),
        })
      ),
    }),
    onSubmit: (data) => {
      // Automatically determine price range based on price input
      const priceRangeMap = {
        1: "$10-$20",
        2: "$20-$30",
        3: "$30-$40",
        4: "$40-$50",
        5: "$50+",
      };

      if (data.price < 20) data.priceRange = 1;
      else if (data.price < 30) data.priceRange = 2;
      else if (data.price < 40) data.priceRange = 3;
      else if (data.price < 50) data.priceRange = 4;
      else data.priceRange = 5;

      if (imageFile) {
        data.imageFile = imageFile;
      }

      data.title = data.title.trim();
      data.description = data.description.trim();
      data.colors = colors;

      data.sizes = sizes
        .filter((s) => s.sizeName.trim() && s.stockQuantity)
        .map((s) => ({
          sizeName: s.sizeName.trim(),
          stockQuantity: parseInt(s.stockQuantity, 10),
        }));

      http
        .post("/product", data)
        .then(() => {
          formik.resetForm();
          setSizes([{ sizeName: "", stockQuantity: "" }]);
          setImageFile(null);
          setColors([]);
          toast.success("Product added successfully!");
          window.location.href = "/";
        })
        .catch((error) => {
          console.error(
            "Error adding product:",
            error.response?.data || error.message
          );
          toast.error(
            error.response?.data?.message ||
              "Failed to add product. Please try again."
          );
        });
    },
  });

  const onFileChange = (e) => {
    setImageError("");
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setImageError("Maximum file size is 1MB");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);
      setIsUploading(true);
      http
        .post("/file/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          setImageFile(res.data.filename);
          setIsUploading(false);
        })
        .catch(() => {
          setImageError("Failed to upload image. Please try again.");
          setIsUploading(false);
        });
    }
  };

  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]);
      setColorInput("");
    }
  };

  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const addSizeField = () => {
    setSizes([...sizes, { sizeName: "", stockQuantity: "" }]);
  };

  const removeSizeField = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    setSizes(updatedSizes);
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = sizes.map((size, i) =>
      i === index ? { ...size, [field]: value } : size
    );
    setSizes(updatedSizes);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "90vh",
        backgroundColor: "#f4f4f4",
        padding: "20px",
        paddingTop: "40px",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "1000px",
          padding: "20px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: "#2c3e50",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Add a New Product
        </Typography>
        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Enter product title"
                margin="dense"
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
              />
              <TextField
                fullWidth
                placeholder="Enter product description"
                margin="dense"
                multiline
                minRows={6}
                label="Description"
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
              <TextField
                fullWidth
                placeholder="Enter product long description"
                margin="dense"
                multiline
                minRows={6}
                label="Long Description"
                name="longDescription"
                value={formik.values.longDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.longDescription &&
                  Boolean(formik.errors.longDescription)
                }
                helperText={
                  formik.touched.longDescription &&
                  formik.errors.longDescription
                }
              />
              <TextField
                fullWidth
                placeholder="Enter product price"
                margin="dense"
                label="Price"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
              />

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Sizes and Stock Quantities:
              </Typography>
              {sizes.map((size, index) => (
                <Grid
                  container
                  key={index}
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      placeholder="Size (e.g., S, M, L)"
                      label="Size"
                      value={size.sizeName}
                      onChange={(e) =>
                        handleSizeChange(index, "sizeName", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      placeholder="Stock Quantity"
                      label="Stock Quantity"
                      type="number"
                      value={size.stockQuantity}
                      onChange={(e) =>
                        handleSizeChange(index, "stockQuantity", e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: "center" }}>
                    {sizes.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeSizeField(index)}
                      >
                        <RemoveCircleOutline />
                      </IconButton>
                    )}
                    {index === sizes.length - 1 && (
                      <IconButton color="primary" onClick={addSizeField}>
                        <AddCircleOutline />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Colors:
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter color"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                />
                <Button variant="contained" onClick={addColor}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {colors.map((color, index) => (
                  <Chip
                    key={index}
                    label={color}
                    onDelete={() => removeColor(color)}
                    color="primary"
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Category Name:
              </Typography>
              <ToggleButtonGroup
                color="primary"
                exclusive
                value={formik.values.categoryName}
                onChange={(e, value) =>
                  formik.setFieldValue("categoryName", value)
                }
              >
                <ToggleButton value="Landing">Landing</ToggleButton>
                <ToggleButton value="New arrivals">New arrivals</ToggleButton>
                <ToggleButton value="Trending">Trending</ToggleButton>
                <ToggleButton value="Women">Women</ToggleButton>
                <ToggleButton value="Men">Men</ToggleButton>
                <ToggleButton value="Girls">Girls</ToggleButton>
                <ToggleButton value="Boys">Boys</ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Fit:
              </Typography>
              <ToggleButtonGroup
                color="primary"
                exclusive
                value={formik.values.fit}
                onChange={(e, value) => formik.setFieldValue("fit", value)}
              >
                <ToggleButton value="Regular Tapered">
                  Regular Tapered
                </ToggleButton>
                <ToggleButton value="Skinny Tapered">
                  Skinny Tapered
                </ToggleButton>
                <ToggleButton value="Seasonal Fit">Seasonal Fit</ToggleButton>
              </ToggleButtonGroup>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  height: "100%",
                  justifyContent: "center",
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    backgroundColor: "#4caf50",
                    "&:hover": { backgroundColor: "#45a049" },
                  }}
                >
                  Upload Image
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={onFileChange}
                  />
                </Button>
                {imageError && (
                  <Typography variant="body2" color="error">
                    {imageError}
                  </Typography>
                )}
                {isUploading ? (
                  <Typography variant="body2" color="textSecondary">
                    Uploading...
                  </Typography>
                ) : (
                  imageFile && (
                    <Box
                      sx={{
                        width: "200px",
                        height: "200px",
                        border: "1px solid #ddd",
                        borderRadius: "4px",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        alt="Product Preview"
                        src={`${
                          import.meta.env.VITE_FILE_BASE_URL
                        }${imageFile}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </Box>
                  )
                )}
              </Box>
            </Grid>
          </Grid>

          <CardActions
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              mt: 4,
            }}
          >
            <Button
              variant="contained"
              type="submit"
              sx={{
                backgroundColor: isUploading ? "#ccc" : "#007bff",
                "&:hover": isUploading ? "#ccc" : "#0056b3",
                padding: "10px 20px",
              }}
              disabled={isUploading || !formik.isValid || !formik.dirty}
            >
              {isUploading ? "Uploading..." : "Add Product"}
            </Button>
          </CardActions>
        </Box>
        <ToastContainer />
      </Card>
    </Box>
  );
}

export default AddProduct;
