import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  Divider,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]); // Store cart items from API
  const [selectedIndexes, setSelectedIndexes] = useState(new Set()); // Track selected items
  const [selectAll, setSelectAll] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [coupon, setCoupon] = useState('');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = () => {
    http
      .get('/cart')
      .then((response) => setCart(response.data))
      .catch(() => alert('Failed to fetch cart items.'));
  };

  const toggleSelectItem = (index) => {
    setSelectedIndexes((prevSelected) => {
      const updatedSelection = new Set(prevSelected);
      if (updatedSelection.has(index)) {
        updatedSelection.delete(index);
      } else {
        updatedSelection.add(index);
      }
      return updatedSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIndexes(new Set());
    } else {
      setSelectedIndexes(new Set(cart.map((_, index) => index)));
    }
    setSelectAll(!selectAll);
  };

  const removeItem = (id) => {
    http
      .delete(`/cart/${id}`)
      .then(fetchCart)
      .catch(() => alert('Failed to remove item.'));
  };

  const calculateTotal = () => {
    return cart
      .filter((_, index) => selectedIndexes.has(index))
      .reduce((total, item) => total + item.price * (item.quantity || 1), 0);
  };

  const total = calculateTotal();

  const applyDiscount = () => {
    if (coupon === 'SAVE10' && total >= 100) {
      setDiscount(10);
      toast.success('Discount Applied: $10 Off!');
    } else {
      setDiscount(0);
      toast.error('Invalid Coupon Code or Minimum Spend $100 Required');
    }
  };

  const getEstimatedDelivery = () => {
    const today = new Date();
    today.setDate(today.getDate() + 5);
    return today.toDateString();
  };

  const handleCheckout = () => {
    if (selectedIndexes.size === 0) {
      alert('Please select at least one item to proceed to checkout.');
      return;
    }

    const selectedCartItems = cart.filter((_, index) =>
      selectedIndexes.has(index)
    );

    http
      .post('/order', selectedCartItems)
      .then((response) => {
        const orderId = response.data.orderId;
        if (!orderId) {
          alert('Error: Order ID is missing.');
          return;
        }

        const deletePromises = selectedCartItems.map((item) =>
          http.delete(`/cart/${item.id}`)
        );

        Promise.all(deletePromises)
          .then(() => {
            fetchCart();
            navigate('/choice', { state: { orderId: orderId } });
          })
          .catch(() => alert('Failed to remove selected items from the cart.'));
      })
      .catch(() => alert('Failed to place order.'));
  };

  return (
    <Box
      sx={{
        maxWidth: 1200,
        mx: 'auto',
        mt: 4,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          My Cart
        </Typography>

        {cart.length === 0 ? (
          <Typography sx={{ minWidth: '500px' }}>No items in cart.</Typography>
        ) : (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Checkbox checked={selectAll} onChange={toggleSelectAll} />
              <Typography>Select All</Typography>
            </Box>
            <Grid container spacing={3}>
              {cart.map((item, index) => (
                <Grid item xs={12} key={index}>
                  <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                    <Checkbox
                      checked={selectedIndexes.has(index)}
                      onChange={() => toggleSelectItem(index)}
                    />
                    <CardMedia
                      component="img"
                      sx={{
                        width: 100,
                        height: 100,
                        objectFit: 'cover',
                        mr: 2,
                      }}
                      image={`${import.meta.env.VITE_FILE_BASE_URL}${item.imageFile}`}
                    />
                    <CardContent>
                      <Typography variant="h6">
                        {item.productTitle || 'No Title'}
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
          </>
        )}
      </Box>

      <Box
        sx={{
          width: '300px',
          padding: '16px',
          boxShadow: 2,
          borderRadius: '8px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <Typography variant="h5" sx={{ marginBottom: 2 }}>
          Total
        </Typography>
        <Typography variant="h6">${(total - discount).toFixed(2)}</Typography>
        <Typography sx={{ marginTop: 1 }}>Shipping: Free</Typography>
        <Divider sx={{ marginY: 1 }} />
        <Typography sx={{ marginBottom: 1 }}>
          Estimated Delivery: {getEstimatedDelivery()}
        </Typography>
        <TextField
          fullWidth
          variant="outlined"
          label="Enter Coupon Code"
          value={coupon}
          onChange={(e) => setCoupon(e.target.value)}
          sx={{ mt: 2 }}
        />
        <Button variant="contained" sx={{ mt: 1 }} onClick={applyDiscount}>
          Apply Discount
        </Button>
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

      <ToastContainer />
    </Box>
  );
}

export default Cart;
