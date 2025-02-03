import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  InputBase,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { Search, Clear } from "@mui/icons-material";
import http from "../http";
import UserContext from "../contexts/UserContext";

function Products({ onAddProductClick }) {
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewFormOpen, setReviewFormOpen] = useState(null);

  const getProducts = () => {
    http
      .get("/product")
      .then((res) => {
        setProductList(res.data);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
      });
  };

  useEffect(() => {
    getProducts();
  }, []);

  const searchProducts = () => {
    http
      .get(`/product?search=${search}`)
      .then((res) => {
        setProductList(res.data);
      })
      .catch((err) => {
        console.error("Error searching products:", err);
      });
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onSearchKeyDown = (e) => {
    if (e.key === "Enter") {
      searchProducts();
    }
  };

  const onClickSearch = () => {
    searchProducts();
  };

  const onClickClear = () => {
    setSearch("");
    getProducts();
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      http
        .delete(`/product/${productToDelete.id}`)
        .then(() => {
          setProductList((prev) =>
            prev.filter((product) => product.id !== productToDelete.id)
          );
          closeDeleteDialog();
        })
        .catch(() => {
          alert("Failed to delete product. Please try again.");
        });
    }
  };

  const getSizeRange = (sizes) => {
    if (!sizes || sizes.length === 0) return "";
    const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    const sortedSizes = sizes
      .map((size) => size.sizeName)
      .filter((name) => sizeOrder.includes(name))
      .sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    return sortedSizes.length === 1
      ? sortedSizes[0]
      : `${sortedSizes[0]}-${sortedSizes[sortedSizes.length - 1]}`;
  };

  const toggleReviewForm = (productId, e) => {
    e.stopPropagation();
    setReviewFormOpen((prev) => (prev === productId ? null : productId));
  };

  const submitReview = (productId, e) => {
    e.stopPropagation();
    if (!reviewText || !reviewRating) {
      alert("Please provide valid review text and a rating.");
      return;
    }

    const reviewData = {
      productId,
      comment: reviewText,
      rating: reviewRating,
      username: user?.name || "Anonymous",
    };

    http
      .post("/reviews", reviewData)
      .then(() => {
        setReviewText("");
        setReviewRating("");
        setReviewFormOpen(null);
      })
      .catch((err) => {
        console.error("Error adding review:", err);
        alert("Failed to add review. Please try again.");
      });
  };

  const viewReviews = (productId, e) => {
    e.stopPropagation();
    navigate(`/reviews/${productId}`);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: 3,
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        Our Products
      </Typography>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 4,
          gap: 1,
        }}
      >
        <InputBase
          value={search}
          placeholder="Search for products..."
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
          sx={{
            border: "1px solid #ccc",
            borderRadius: "50px",
            padding: "0.5rem 1rem",
            flex: 1,
            maxWidth: 400,
          }}
        />
        <IconButton color="primary" onClick={onClickSearch}>
          <Search />
        </IconButton>
        <IconButton color="secondary" onClick={onClickClear}>
          <Clear />
        </IconButton>
        {user && (
          <Button
            variant="contained"
            color="primary"
            onClick={onAddProductClick}
            sx={{ borderRadius: "50px" }}
          >
            Add Product
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {productList.map((product) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
            <Card
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%",
                borderRadius: "12px",
                boxShadow: "none",
                border: "1px solid #e0e0e0",
                transition: "transform 0.2s",
                "&:hover": {
                  transform: "scale(1.03)",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                },
              }}
              onClick={() => navigate(`/product/${product.id}`)}
            >
              {product.imageFile && (
                <CardMedia
                  component="img"
                  alt="Product Image"
                  image={`${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile}`}
                  sx={{ height: 250, objectFit: "cover" }}
                />
              )}
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: "bold", marginBottom: 1 }}
                  >
                    {product.categoryName}
                  </Typography>

                  {product.sizes?.length > 0 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: "bold" }}
                    >
                      {getSizeRange(product.sizes)}
                    </Typography>
                  )}
                </Box>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", marginBottom: 1 }}
                >
                  {product.title}
                </Typography>
                {product.sizes?.length > 0 && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: "bold", marginBottom: 1 }}
                  >
                    Total Quantity Available:{" "}
                    {product.sizes.reduce(
                      (total, size) => total + size.stockQuantity,
                      0
                    )}
                  </Typography>
                )}
                {product.discountedPrice ? (
                  <Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        textDecoration: "line-through",
                        fontSize: "0.9rem",
                      }}
                    >
                      ${product.originalPrice?.toFixed(2)}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary"
                      sx={{ fontWeight: "bold" }}
                    >
                      ${product.discountedPrice.toFixed(2)}
                    </Typography>
                  </Box>
                ) : (
                  <Typography
                    variant="h6"
                    color="primary"
                    sx={{ fontWeight: "bold" }}
                  >
                    ${product.price?.toFixed(2)}
                  </Typography>
                )}
              </CardContent>

              <Box sx={{ padding: 2 }}>
                {user && (
                  <Button
                    variant="text"
                    color="primary"
                    onClick={(e) => toggleReviewForm(product.id, e)}
                    sx={{ marginTop: 1 }}
                  >
                    {reviewFormOpen === product.id ? "Cancel" : "Write a Review"}
                  </Button>
                )}

                {reviewFormOpen === product.id && (
                  <Box
                    sx={{ marginTop: 2 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <InputBase
                      placeholder="Write your review..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      sx={{
                        border: "1px solid #ccc",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        marginBottom: 1,
                        width: "100%",
                      }}
                    />
                    <FormControl
                      sx={{
                        minWidth: 120,
                        marginBottom: 1,
                      }}
                    >
                      <InputLabel id="rating-label">Rating</InputLabel>
                      <Select
                        labelId="rating-label"
                        value={reviewRating}
                        onChange={(e) => setReviewRating(e.target.value)}
                      >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => submitReview(product.id, e)}
                    >
                      Submit
                    </Button>
                  </Box>
                )}
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={(e) => viewReviews(product.id, e)}
                  sx={{ marginTop: 2 }}
                >
                  View All Reviews
                </Button>
              </Box>

              {user && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: 1,
                  }}
                >
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/editproduct/${product.id}`);
                    }}
                    sx={{ fontSize: "0.8rem" }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteDialog(product);
                    }}
                    sx={{ fontSize: "0.8rem" }}
                  >
                    Delete
                  </Button>
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteProduct}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products;
