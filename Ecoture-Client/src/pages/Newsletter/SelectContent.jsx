import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Grid, CardMedia, TextField } from "@mui/material";
import http from "../../http";

function SelectContent() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [contentTitle, setContentTitle] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    http
      .get("/Product")
      .then((res) => {
        setProducts(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  }, []);

  const handleProductClick = (productId) => {
    setSelectedProducts((prevSelected) =>
      prevSelected.includes(productId)
        ? prevSelected.filter((id) => id !== productId)
        : [...prevSelected, productId]
    );
  };

  const handleConfirmSelection = () => {
    if (!contentTitle.trim()) {
      setError("Content title is required.");
      return;
    }

    if (selectedProducts.length === 0) {
      setError("Please select at least one product.");
      return;
    }
    setError("");
    http
      .post("/Content", { ProductIds: selectedProducts, ContentTitle: contentTitle })
      .then((res) => {
        console.log("Content created successfully:", res.data);
        navigate('/');
      })
      .catch((err) => {
        console.error("Error creating content:", err);
      });
  };

  return (
    <Box
      sx={{
        padding: "20px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" sx={{ marginBottom: "20px" }}>
        Select Products
      </Typography>

      <Grid container spacing={3} sx={{ width: "100%", maxWidth: "1200px" }}>
        {products.map((product) => (
          <Grid item xs={12} sm={6} md={4} key={product.id}>
            <Card
              onClick={() => handleProductClick(product.id)}
              sx={{
                cursor: "pointer",
                border:
                  selectedProducts.includes(product.id)
                    ? "2px solid #4caf50"
                    : "1px solid #e0e0e0",
                boxShadow: selectedProducts.includes(product.id) ? 4 : 1,
                "&:hover": {
                  boxShadow: 6,
                },
              }}
            >
              <CardMedia
                component="img"
                alt={product.title || "Product Image"}
                image={
                  product.imageFile
                    ? `${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile}`
                    : "/placeholder.png"
                }
              />
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {product.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {product.description}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ marginTop: "10px", color: "green", fontWeight: "bold" }}
                >
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Quantity Available: {product.stockQuantity}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{marginTop: "20px", width: "100%", maxWidth: "1200px",}}>
        <TextField
          fullWidth
          label="Content Title"
          variant="outlined"
          value={contentTitle}
          onChange={(e) => setContentTitle(e.target.value)}
          error={!!error && !contentTitle.trim()}
          helperText={!contentTitle.trim() && error}
        />
      </Box>

      <Button variant="contained" color="primary" sx={{ marginTop: "20px" }} onClick={handleConfirmSelection}>
        Confirm Selection
      </Button>

      {error && selectedProducts.length === 0 && (
        <Typography color="error" variant="body2" sx={{ marginTop: "10px", textAlign: "center" }}>
          {error}
        </Typography>
      )}
    </Box>
  );
}

export default SelectContent;
