import React, { useEffect, useState } from "react";
import { Box, Typography, Card, CardContent, IconButton, CircularProgress } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import http from "utils/http";

function RequestApproval() {
  const [refundRequests, setRefundRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = () => {
    setLoading(true);
    http.get("/refund/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } // ✅ Ensure token is included
    })
      .then((res) => {
        setRefundRequests(res.data);
      })
      .catch((error) => {
        console.error("Error fetching refunds:", error);
        alert("Failed to fetch refund requests.");
      })
      .finally(() => setLoading(false));
  };

  const handleApprove = (id) => {
    updateRefundStatus(id, "Approved");
  };

  const handleReject = (id) => {
    updateRefundStatus(id, "Rejected");
  };

  const updateRefundStatus = (id, status) => {
    http.put(`/refund/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then(() => {
        alert(`Refund request ${status.toLowerCase()} successfully.`);
        fetchRefundRequests(); // Refresh the list
      })
      .catch((error) => {
        console.error(`Error updating refund request ${id}:`, error);
        alert("Failed to update refund request.");
      });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 1200 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}>
        Refund Approvals
      </Typography>

      {refundRequests.length === 0 ? (
        <Typography>No refund requests available.</Typography>
      ) : (
        refundRequests.map((refund) => (
          <Card key={refund.id} sx={{ mb: 4, p: 3, display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: 2, boxShadow: 3 }}>
            
            {/* Refund Details */}
            <CardContent sx={{ flex: 1 }}>
              <Typography variant="h6">
                <strong>Refund Request ID:</strong> {refund.id}
              </Typography>
              <Typography><strong>Order Item ID:</strong> {refund.orderItemId}</Typography>
              <Typography><strong>User ID:</strong> {refund.userId}</Typography>
              <Typography><strong>Reason:</strong> {refund.reason}</Typography>
              <Typography><strong>Status:</strong> {refund.status}</Typography>
              <Typography><strong>Requested At:</strong> {new Date(refund.createdAt).toLocaleString()}</Typography>
            </CardContent>

            {/* Approve & Reject Icons */}
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6"><strong>Approve:</strong></Typography>
                <IconButton onClick={() => handleApprove(refund.id)} sx={{ color: "green" }}>
                  <CheckCircleOutlineIcon fontSize="large" />
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="h6"><strong>Reject:</strong></Typography>
                <IconButton onClick={() => handleReject(refund.id)} sx={{ color: "red" }}>
                  <HighlightOffIcon fontSize="large" />
                </IconButton>
              </Box>
            </Box>

          </Card>
        ))
      )}
    </Box>
  );
}

export default RequestApproval;
