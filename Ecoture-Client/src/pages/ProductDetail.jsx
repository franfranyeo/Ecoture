import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Grid, Button, CardMedia, Chip } from "@mui/material";
import { ArrowBack } from "@mui/icons-material";
import http from "../http";

function ProductDetail() {
  const { id } = useParams(); // Extract the product ID from the URL
  const [product, setProduct] = useState(null); // State to store product details
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state
  const navigate = useNavigate(); // Hook for navigation

  // Price Range mapping
  const priceRangeLabels = {
    1: "$10-$20",
    2: "$20-$30",
    3: "$30-$40",
    4: "$40-$50",
    5: "$50+",
  };

  // Function to get readable price range label
  const getPriceRangeLabel = (priceRange) =>
    priceRangeLabels[priceRange] || "N/A";

  // Fetch product details from the backend
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

  // Render loading or error state
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
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            <strong>Category:</strong> {product.categoryName}
          </Typography>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            <strong>Fit:</strong> {product.fit}
          </Typography>
          <Box sx={{ marginBottom: 2 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: "bold", marginBottom: 1 }}
            >
              Colors:
            </Typography>
            {product.colors && product.colors.length > 0 ? (
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {product.colors.map((color, index) => (
                  <Chip key={index} label={color.colorName} color="primary" />
                ))}
              </Box>
            ) : (
              <Typography variant="body2">No colors available</Typography>
            )}
          </Box>
          <Typography variant="body2" sx={{ marginBottom: 2 }}>
            <strong>Price Range:</strong>{" "}
            {priceRangeLabels[product.priceRange] || "N/A"}
          </Typography>

          <Box sx={{ marginBottom: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Sizes and Stock Quantities:
            </Typography>
            {product.sizes && product.sizes.length > 0 ? (
              product.sizes.map((size, index) => (
                <Typography key={index} variant="body2">
                  {`${size.sizeName}: ${size.stockQuantity} in stock`}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No sizes available</Typography>
            )}
          </Box>
          <Button
            variant="contained"
            color="success"
            sx={{
              marginTop: 2,
              padding: "0.75rem 1.5rem",
              fontWeight: "bold",
              borderRadius: "8px",
            }}
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProductDetail;
