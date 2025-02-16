import React, { useEffect, useState } from "react";
import { 
  Box, Typography, Card, CardContent, IconButton, CircularProgress, Avatar 
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import http from "utils/http";

function RequestApproval() {
  const [refundRequests, setRefundRequests] = useState([]);
  const [userDetails, setUserDetails] = useState({}); // Store user details
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefundRequests();
  }, []);

  const fetchRefundRequests = () => {
    setLoading(true);
    http.get("/refund/all", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    })
      .then((res) => {
        setRefundRequests(res.data);
        fetchUserDetails(res.data); // Fetch user details after getting refund data
      })
      .catch((error) => {
        console.error("Error fetching refunds:", error);
        alert("Failed to fetch refund requests.");
      })
      .finally(() => setLoading(false));
  };

  // Fetch user details based on userId
  const fetchUserDetails = async (refunds) => {
    const userIds = [...new Set(refunds.map((r) => r.userId))]; // Unique user IDs

    const userPromises = userIds.map(async (userId) => {
      try {
        const res = await http.get(`/user/${userId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });

        return { userId, data: res.data }; // Ensure correct mapping
      } catch (error) {
        console.error(`Failed to fetch user ${userId}:`, error);
        return { userId, data: null };
      }
    });

    const users = await Promise.all(userPromises);
    const userMap = users.reduce((acc, { userId, data }) => {
      if (data) {
        acc[userId] = data;
      }
      return acc;
    }, {});

    console.log("User Details Fetched:", userMap); // Debugging log

    setUserDetails(userMap); // Store in state
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
    <Box sx={{ mt: 4, mx: "auto", maxWidth: 800 }}>
      <Typography variant="h4" sx={{ mb: 4, textAlign: "center", fontWeight: "bold" }}>
        Refund Approvals
      </Typography>

      {refundRequests.length === 0 ? (
        <Typography>No refund requests available.</Typography>
      ) : (
        refundRequests.map((refund) => {
          const user = userDetails[refund.userId] || {}; // Get user details
          
          return (
            <Card key={refund.id} sx={{ mb: 4, p: 3, borderRadius: 2, boxShadow: 3 }}>
              
              {/* User Profile Section */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Avatar
                  src={user.pfpURL || "https://via.placeholder.com/50"} // Default image if missing
                  alt={user.Email || "User"}
                  sx={{ width: 60, height: 60 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    {user.email || "Unknown"}
                  </Typography>
                </Box>
              </Box>

              {/* Refund Details */}
              <CardContent sx={{ p: 0 }}>
                <Typography sx={{ fontWeight: "bold", fontSize: "1rem" }}>Refund Request ID: {refund.id}</Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "gray" }}>
                  <strong>Order Item ID:</strong> {refund.orderItemId}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "gray" }}>
                  <strong>Reason:</strong> {refund.reason}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: refund.status === "Approved" ? "green" : refund.status === "Rejected" ? "red" : "orange" }}>
                  <strong>Status:</strong> {refund.status}
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "gray" }}>
                  <strong>Requested At:</strong> {new Date(refund.createdAt).toLocaleString()}
                </Typography>
              </CardContent>

              {/* Approve & Reject Icons */}
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 2 }}>
                <IconButton onClick={() => handleApprove(refund.id)} sx={{ color: "green" }}>
                  <CheckCircleOutlineIcon fontSize="large" />
                </IconButton>
                <IconButton onClick={() => handleReject(refund.id)} sx={{ color: "red" }}>
                  <HighlightOffIcon fontSize="large" />
                </IconButton>
              </Box>

            </Card>
          );
        })
      )}
    </Box>
  );
}

export default RequestApproval;
