import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import { AddCircleOutline, RemoveCircleOutline } from "@mui/icons-material";
import { Chip } from "@mui/material";

import { useFormik } from "formik";
import * as yup from "yup";
import http from "../http";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState([]); // State for colors
  const [colorInput, setColorInput] = useState(""); // State for input color

  // Function to add a color to the list
  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]); // Ensure colors is an array of strings
      setColorInput("");
    }
  };

  // Function to remove a color from the list
  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const [sizes, setSizes] = useState([{ sizeName: "", stockQuantity: "" }]);

  const priceRangeMap = {
    1: "$10-$20",
    2: "$20-$30",
    3: "$30-$40",
    4: "$40-$50",
    5: "$50+",
  };

  const reversePriceRangeMap = Object.fromEntries(
    Object.entries(priceRangeMap).map(([k, v]) => [v, parseInt(k)])
  );

  useEffect(() => {
    http
      .get(`/product/${id}`)
      .then((res) => {
        const data = res.data;

        // Function to determine price range based on price
        const determinePriceRange = (price) => {
          if (price <= 20) return 1; // "$10-$20"
          if (price <= 30) return 2; // "$20-$30"
          if (price <= 40) return 3; // "$30-$40"
          if (price <= 50) return 4; // "$40-$50"
          return 5; // "$50+"
        };

        // Assign calculated priceRange
        const computedPriceRange = determinePriceRange(data.price);

        setProduct({
          ...data,
          priceRange: computedPriceRange, // Store calculated price range
        });

        setImageFile(data.imageFile);
        setSizes(data.sizes || [{ sizeName: "", stockQuantity: "" }]);
        setColors(data.colors ? data.colors.map((c) => c.colorName) : []);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load product data.");
        setLoading(false);
      });
  }, [id]);

  const formik = useFormik({
    initialValues: {
      title: product.title || "",
      description: product.description || "",
      longDescription: product.longDescription || "",
      price: product.price || "",
      categoryName: product.categoryName || "",
      colour: product.colour || "",
      fit: product.fit || "",
    },
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
    }),
    onSubmit: (values) => {
      console.log("Form submitted with values:", values);

      // Create the request body
      const requestBody = {
        title: values.title,
        description: values.description,
        longDescription: values.longDescription,
        price: parseFloat(values.price), //  Backend will now determine price range
        categoryName: values.categoryName,
        fit: values.fit,
        imageFile: imageFile,
        sizes: sizes.map((s) => ({
          sizeName: s.sizeName.trim(),
          stockQuantity: parseInt(s.stockQuantity, 10),
        })),
        colors: colors,
      };

      console.log("Sending request body:", requestBody);

      // Make the API call
      http
        .put(`/product/${id}`, requestBody)
        .then((response) => {
          console.log("Update successful:", response);
          toast.success("Product updated successfully!");
          navigate("/");
        })
        .catch((error) => {
          console.error("Update failed:", error);
          toast.error(
            error.response?.data?.message || "Failed to update product"
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

  const getImageUrl = (fileName) => {
    return `${import.meta.env.VITE_FILE_BASE_URL}${fileName}`;
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteProduct = () => {
    http
      .delete(`/product/${id}`)
      .then(() => {
        toast.success("Product deleted successfully!");
        navigate("/");
      })
      .catch(() => {
        toast.error("Failed to delete product. Please try again.");
      });
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        minHeight: "100vh",
        backgroundColor: "#f4f4f4",
        padding: "40px 20px",
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: "1000px",
          padding: "30px",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          backgroundColor: "#ffffff",
        }}
      >
        {/*  Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate("/")}
          sx={{
            marginBottom: 2,
            marginTop: 4, //  ADD MORE SPACING AT THE TOP
            backgroundColor: "#fff",
            color: "black",
            borderColor: "#ccc",
            "&:hover": {
              backgroundColor: "#f9f9f9",
              borderColor: "#aaa",
            },
          }}
        >
          Back to Products
        </Button>

        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: "#2c3e50",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          Edit Product
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                minRows={2}
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
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Long Description"
                name="longDescription"
                multiline
                minRows={3}
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
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Price Range:{" "}
                <strong>{priceRangeMap[product.priceRange] || "N/A"}</strong>
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
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

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
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
                    label={color} // Ensure this is a string
                    onDelete={() => removeColor(color)}
                    color="primary"
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
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
                        src={getImageUrl(imageFile)}
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
            sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}
          >
            <Button
              type="submit" // Make sure it submits the form
              variant="contained"
              sx={{
                backgroundColor: "#4caf50",
                "&:hover": { backgroundColor: "#45a049" },
              }}
            >
              Update
            </Button>

            <Button variant="contained" color="error" onClick={handleOpen}>
              Delete
            </Button>
          </CardActions>
        </Box>
        <ToastContainer />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={deleteProduct}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EditProduct;
