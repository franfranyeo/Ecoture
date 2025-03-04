import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';

import { Box, Button, Card, CardContent, Typography } from '@mui/material';

function Confirmation() {
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { state } = useLocation();

  useEffect(() => {
    if (!state || !state.orderId) {
      toast.error('Order ID is missing.');
      navigate('/cart');
      return;
    }
    // Fetch Order Details
    http
      .get(`/order/${state.orderId}`)
      .then((res) => setOrder(res.data))
      .catch(() => toast.error('Failed to fetch order details.'))
      .finally(() => setLoading(false));
  }, [state, navigate]);

  if (loading) return <Typography>Loading order details...</Typography>;

  if (!order)
    return (
      <Box sx={{ mt: 4, mx: "auto", maxWidth: 800 }}>
        <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}>
          Order Confirmation
        </Typography>

        <Card sx={{ mb: 3, p: 2 }}>
          <CardContent>
            <Typography variant="h6">Order ID: {order?.id}</Typography>
            <Typography>Total Price: ${order?.totalPrice?.toFixed(2)}</Typography>
            <Typography>Date: {new Date(order?.createdAt).toLocaleString()}</Typography>
          </CardContent>
        </Card>

        {order?.orderItems && order?.orderItems.length > 0 ? (
          order.orderItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2, p: 2, display: "flex", alignItems: "center" }}>
              <img
                src={`${import.meta.env.VITE_FILE_BASE_URL}${item.imageFile}`}
                alt={item.productTitle}
                width="80"
                height="80"
                style={{ marginRight: 10 }}
              />
              <CardContent>
                <Typography variant="h6">{item.productTitle}</Typography>
                <Typography>Color: {item.color} | Size: {item.size}</Typography>
                <Typography>Quantity: {item.quantity}</Typography>
                <Typography>${item.price.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          ))
        ) : (
          <Typography>No items in this order.</Typography>
        )}

        {/* Buttons for Navigation */}
        <Box sx={{ textAlign: "center", mt: 4 }}>
          <Button variant="contained" onClick={() => navigate("/order-history")} sx={{ mr: 2 }}>
            Order History
          </Button>
          <Button variant="contained" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </Box>
      </Box>
    );

  return (
    <Box sx={{ mt: 4, mx: 'auto', maxWidth: 800 }}>
      <Typography
        variant="h4"
        sx={{ mb: 4, textAlign: 'center', fontWeight: 'bold' }}
      >
        Order Confirmation
      </Typography>

      <Card sx={{ mb: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h6">Order ID: {order.id}</Typography>
          <Typography>Total Price: ${order.totalPrice.toFixed(2)}</Typography>
          <Typography>
            Date: {new Date(order.createdAt).toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {order.orderItems && order.orderItems.length > 0 ? (
        order.orderItems.map((item) => (
          <Card
            key={item.id}
            sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center' }}
          >
            <img
              src={`${import.meta.env.VITE_FILE_BASE_URL}${item.imageFile}`}
              alt={item.productTitle}
              width="80"
              height="80"
              style={{ marginRight: 10 }}
            />
            <CardContent>
              <Typography variant="h6">{item.productTitle}</Typography>
              <Typography>
                Color: {item.color} | Size: {item.size}
              </Typography>
              <Typography>Quantity: {item.quantity}</Typography>
              <Typography>${item.price.toFixed(2)}</Typography>
            </CardContent>
          </Card>
        ))
      ) : (
        <Typography>No items in this order.</Typography>
      )}

      {/* Buttons for Navigation */}
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Button variant="contained" onClick={() => navigate('/order-history')} sx={{ mr: 2 }}>
          Order History
        </Button>
        <Button variant="contained" onClick={() => navigate('/')}>
          Back to Home
        </Button>
      </Box>
    </Box>
  );
}

export default Confirmation;
