import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Card, CardContent, Button, 
  Dialog, DialogTitle, DialogContent, TextField, DialogActions 
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import http from "utils/http";

function OrderHistory() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refundDialog, setRefundDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refundReason, setRefundReason] = useState("");

  useEffect(() => {
    http.get("/order")
      .then((res) => setOrders(res.data))
      .catch(() => alert("Failed to fetch order history."))
      .finally(() => setLoading(false));
  }, []);

  const handleRefundRequest = () => {
    if (!refundReason.trim()) {
      alert("Please enter a refund reason.");
      return;
    }

    if (selectedItem == null) {
      alert("No valid order item selected for refund.");
      console.error("Error: selectedItem is undefined or missing ID.", selectedItem);
      return;
    }

    const requestData = {
      orderItemId: selectedItem.productId,  
      reason: refundReason,
      status: "Pending"
    };

    console.log("Submitting Refund Request:", requestData);

    http.post("/refund", requestData)
      .then((res) => {
        console.log("Refund Response:", res.data);
        alert("Refund request submitted successfully.");
        setRefundDialog(false);
        setRefundReason("");
      })
      .catch((err) => {
        console.error("Refund Error:", err.response ? err.response.data : err);
        alert("Failed to submit refund request.");
      });
  };

  if (loading) return <Typography>Loading order history...</Typography>;

  return (
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 1200 }}>

      {/* Navigation Tabs */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Button 
          sx={{
            mx: 1, 
            fontWeight: "bold",
            backgroundColor: location.pathname === "/order-history" ? "#3E3E3E" : "transparent",
            color: location.pathname === "/order-history" ? "white" : "black",
            borderRadius: "20px",
            padding: "8px 16px",
            "&:hover": { backgroundColor: "#3E3E3E", color: "white" }
          }} 
          onClick={() => navigate("/order-history")}
        >
          Order History
        </Button>
        <Button 
          sx={{
            mx: 1, 
            fontWeight: "bold",
            backgroundColor: location.pathname === "/refund-requests" ? "#3E3E3E" : "transparent",
            color: location.pathname === "/refund-requests" ? "white" : "black",
            borderRadius: "20px",
            padding: "8px 16px",
            "&:hover": { backgroundColor: "#3E3E3E", color: "white" }
          }} 
          onClick={() => navigate("/refund-requests")}
        >
          Refund Requests
        </Button>
      </Box>

      {/* Order List */}
      {orders.length === 0 ? (
        <Typography>No past orders found.</Typography>
      ) : (
        orders.map((order) => (
          <Card key={order.id} sx={{ mb: 4, p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 200 }}>
            
            {/* Product List */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "70%" }}>
              {order.orderItems.map((item) => (
                <Card key={item.id} sx={{ display: "flex", alignItems: "center", p: 2, width: "100%", boxShadow: 1 }}>
                  <img
                    src={`${import.meta.env.VITE_FILE_BASE_URL}${item.imageFile}`}
                    alt={item.productTitle}
                    width="100"
                    height="100"
                    style={{ marginRight: 16, borderRadius: 8 }}
                  />
                  <CardContent>
                    <Typography variant="h6">{item.productTitle}</Typography>
                    <Typography>Color: {item.color} | Size: {item.size}</Typography>
                    <Typography>Quantity: {item.quantity}</Typography>
                    <Typography>${item.price.toFixed(2)}</Typography>
                    <Button 
                      variant="outlined" 
                      color="error" 
                      sx={{ mt: 1 }} 
                      onClick={() => { 
                        setSelectedItem(item); 
                        setRefundDialog(true); 
                      }}
                    >
                      Request Refund
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </Box>

            {/* Order Details */}
            <Box sx={{ textAlign: "right", minWidth: 250 }}>
              <Typography variant="h6"><strong>Order ID:</strong> {order.id}</Typography>
              <Typography><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</Typography>
              <Typography><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</Typography>
            </Box>
          </Card>
        ))
      )}

      {/* Refund Request Dialog */}
      <Dialog open={refundDialog} onClose={() => setRefundDialog(false)}>
        <DialogTitle>Request Refund</DialogTitle>
        <DialogContent>
          <TextField 
            label="Reason" 
            fullWidth 
            value={refundReason} 
            onChange={(e) => setRefundReason(e.target.value)} 
            multiline rows={3} 
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRefundDialog(false)}>Cancel</Button>
          <Button onClick={handleRefundRequest} color="error">Submit</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default OrderHistory;
