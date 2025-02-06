import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Button, CardMedia, Chip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import http from "../http";

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const navigate = useNavigate();

  const priceRangeLabels = {
    1: "$10-$20",
    2: "$20-$30",
    3: "$30-$40",
    4: "$40-$50",
    5: "$50+",
  };

  useEffect(() => {
    setLoading(true);
    http
      .get(`/product/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching product details:", err);
        setError("Failed to load product details.");
        setLoading(false);
      });
  }, [id]);

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: "80px 16px 16px" }}>
      <Button
        variant="outlined"
        startIcon={<ArrowBack />}
        onClick={() => navigate("/")}
        sx={{
          marginBottom: 2,
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

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <CardMedia
            component="img"
            alt={product.title || "Product Image"}
            image={
              product.imageFile
                ? `${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile}`
                : "/placeholder.png"
            }
            sx={{
              width: "100%",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          />
          {product.longDescription && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                Detailed Description:
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", marginTop: 1 }}
              >
                {product.longDescription}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ fontWeight: "bold", marginBottom: 2 }}>
            {product.title}
          </Typography>
          <Typography variant="h5" color="primary" sx={{ marginBottom: 2 }}>
            ${product.price?.toFixed(2) || "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {product.description}
          </Typography>

          {/* Categories Section */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              marginBottom: 1,
              color: "#555", // Slightly darker text to contrast with the background
            }}
          >
            Categories:
          </Typography>
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: 2 }}
          >
            {product.categories?.map((category, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  backgroundColor: "transparent", // No background to avoid button-like effect
                  padding: "5px 10px", // Subtle padding for spacing
                  borderRadius: "10px", // Slightly rounded for a more clean, soft look
                  color: "#333", // Darker text for readability
                  fontWeight: "normal", // Not bold to avoid button-like feel
                  border: "1px solid #ccc", // Add subtle border for distinction
                }}
              >
                {category.categoryName}
              </Typography>
            ))}
          </Box>

          {/* Fits Section */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              marginBottom: 1,
              color: "#555",
            }}
          >
            Fits:
          </Typography>
          <Box
            sx={{ display: "flex", flexWrap: "wrap", gap: 1, marginBottom: 2 }}
          >
            {product.fits && product.fits.length > 0 ? (
              product.fits.map((fit, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    backgroundColor: "transparent", // No background
                    padding: "5px 10px", // Subtle padding for spacing
                    borderRadius: "10px", // Rounded corners
                    color: "#333", // Dark text color for better readability
                    fontWeight: "normal", // Normal weight text
                    border: "1px solid #ccc", // Subtle border to differentiate
                  }}
                >
                  {fit.fitName}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No fits available</Typography>
            )}
          </Box>

          {/* Price Range Section */}
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", marginBottom: 2 }}
          >
            Price Range: {priceRangeLabels[product.priceRange] || "N/A"}
          </Typography>

          {/* Color Selection */}
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", marginBottom: 1 }}
          >
            Select Color:
          </Typography>
          <Box
            sx={{ display: "flex", gap: 1, flexWrap: "wrap", marginBottom: 2 }}
          >
            {product.colors && product.colors.length > 0 ? (
              product.colors.map((color, index) => (
                <Chip
                  key={index}
                  label={color.colorName}
                  color={
                    selectedColor === color.colorName ? "secondary" : "default"
                  } // Turns green when selected
                  sx={{
                    backgroundColor:
                      selectedColor === color.colorName ? "green" : "#f0f0f0", // Green when selected, grey otherwise
                    color: selectedColor === color.colorName ? "#fff" : "#555", // White text when selected, grey when not selected
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor:
                        selectedColor === color.colorName ? "green" : "#e0e0e0",
                    },
                  }}
                  onClick={() => setSelectedColor(color.colorName)}
                />
              ))
            ) : (
              <Typography variant="body2">No colors available</Typography>
            )}
          </Box>

          {/* Size Selection */}
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", marginBottom: 1 }}
          >
            Select Size:
          </Typography>
          <Box
            sx={{ display: "flex", gap: 1, flexWrap: "wrap", marginBottom: 2 }}
          >
            {product.sizes && product.sizes.length > 0 ? (
              product.sizes.map((size, index) => (
                <Chip
                  key={index}
                  label={`${size.sizeName} (${size.stockQuantity} in stock)`}
                  color={
                    selectedSize === size.sizeName ? "secondary" : "default"
                  } // Turns green when selected
                  sx={{
                    backgroundColor:
                      selectedSize === size.sizeName ? "green" : "#f0f0f0", // Green when selected, grey otherwise
                    color: selectedSize === size.sizeName ? "#fff" : "#555", // White text when selected, grey when not selected
                    cursor: "pointer",
                    "&:hover": {
                      backgroundColor:
                        selectedSize === size.sizeName ? "green" : "#e0e0e0",
                    },
                  }}
                  onClick={() => setSelectedSize(size.sizeName)}
                />
              ))
            ) : (
              <Typography variant="body2">No sizes available</Typography>
            )}
          </Box>

          {/* Add to Cart Button */}
          <Button
            variant="contained"
            color="success"
            sx={{
              marginTop: 2,
              padding: "0.75rem 1.5rem",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
            disabled={!selectedColor || !selectedSize}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProductDetail;
