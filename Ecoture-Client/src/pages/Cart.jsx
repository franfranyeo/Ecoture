import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Divider,
  Checkbox,
} from "@mui/material";
import http from "../http";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]); // Store cart items from API
  const [selectedIndexes, setSelectedIndexes] = useState(new Set()); // Track selected items

  // ✅ Fetch cart data from API
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    http
      .get("/cart")
      .then((response) => {
        setCart(response.data); // Update state with fetched data
      })
      .catch(() => alert("Failed to fetch cart items."));
  };

  // ✅ Toggle item selection using index
  const toggleSelectItem = (index) => {
    setSelectedIndexes((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(index)) {
        updatedSelection.delete(index); // Deselect
      } else {
        updatedSelection.add(index); // Select
      }
      return updatedSelection;
    });
  };

  // ✅ Remove item from cart using API
  const removeItem = (id) => {
    http
      .delete(`/cart/${id}`)
      .then(fetchCart)
      .catch(() => alert("Failed to remove item."));
  };

  // ✅ Calculate total for selected items
  const calculateTotal = () => {
    return cart
      .filter((_, index) => selectedIndexes.has(index))
      .reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  };

  const total = calculateTotal(); // Compute the total dynamically

  // ✅ Handle checkout (store selected items in database and navigate to addresses)
  const handleCheckout = () => {
    if (selectedIndexes.size === 0) {
      alert("Please select at least one item to proceed to checkout.");
      return;
    }

    const selectedCartItems = cart.filter((_, index) =>
      selectedIndexes.has(index)
    );

    http
      .post("/order", selectedCartItems)
      .then((response) => {
        const orderId = response.data.orderId;
        if (!orderId) {
          alert("Error: Order ID is missing.");
          return;
        }

        // Remove selected items from the cart
        const deletePromises = selectedCartItems.map((item) =>
          http.delete(`/cart/${item.id}`)
        );

        Promise.all(deletePromises)
          .then(() => {
            
            fetchCart(); // Refresh the cart to reflect the changes
            navigate(`/choice`, { state: { orderId: orderId } }); // Redirect to choice page
          })
          .catch(() => alert("Failed to remove selected items from the cart."));
      })
      .catch(() => alert("Failed to place order."));
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: "auto",
        mt: 4,
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
          My Cart
        </Typography>
        {cart.length === 0 ? (
          <Typography>No items in cart.</Typography>
        ) : (
          <Grid container spacing={3}>
            {cart.map((item, index) => (
              <Grid item xs={12} key={index}>
                <Card sx={{ display: "flex", alignItems: "center", p: 2 }}>
                  <Checkbox
                    checked={selectedIndexes.has(index)}
                    onChange={() => toggleSelectItem(index)}
                  />
                  <CardMedia
                    component="img"
                    sx={{ width: 100, height: 100, objectFit: "cover", mr: 2 }}
                    image={`${import.meta.env.VITE_FILE_BASE_URL}${item.imageFile}`}
                  />
                  <CardContent>
                    <Typography variant="h6">
                      {item.productTitle || "No Title"}
                    </Typography>
                    <Typography>
                      Color: {item.color} | Size: {item.size}
                    </Typography>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Typography>
                      ${(item.price * (item.quantity || 1)).toFixed(2)}
                    </Typography>
                  </CardContent>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </Button>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Total Section */}
      <Box
        sx={{
          width: "300px",
          padding: "16px",
          boxShadow: 2,
          borderRadius: "8px",
          backgroundColor: "#f9f9f9",
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Total
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          ${total.toFixed(2)}
        </Typography>

        <Typography sx={{ marginTop: 1, fontWeight: "normal" }}>
          Shipping: Free
        </Typography>

        <Divider sx={{ marginY: 1 }} />

        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Subtotal: ${total.toFixed(2)}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          sx={{ marginTop: 2 }}
          onClick={handleCheckout}
          disabled={!selectedIndexes.size}
        >
          Checkout
        </Button>
      </Box>
    </Box>
  );
}

export default Cart;
