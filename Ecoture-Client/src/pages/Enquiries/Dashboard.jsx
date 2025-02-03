import React, { useEffect, useState } from "react";
import { Box, Card, CardContent, Typography, Button, Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import http from "../../http";

function Dashboard() {
  const [enquiryStats, setEnquiryStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    inProgress: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    http.get("/Enquiry/Summary")
      .then((res) => {
        setEnquiryStats(res.data);
      })
      .catch((err) => console.error("Error fetching enquiry summary:", err));
  }, []);

  return (
    <Box sx={{ padding: "20px" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <Typography variant="h4">Dashboard</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/addenquiry")}
        >
          Add Enquiry
        </Button>
      </Box>


      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#e3f2fd", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">Total Enquiries</Typography>
              <Typography variant="h4">{enquiryStats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#c8e6c9", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">Open</Typography>
              <Typography variant="h4">{enquiryStats.open}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#ffcdd2", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">Closed</Typography>
              <Typography variant="h4">{enquiryStats.closed}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ backgroundColor: "#fff9c4", textAlign: "center" }}>
            <CardContent>
              <Typography variant="h6">In Progress</Typography>
              <Typography variant="h4">{enquiryStats.inProgress}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      <Box sx={{ marginTop: "20px", display: "flex", justifyContent: "center" }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{
            textTransform: 'none',
            fontSize: '1rem',
            borderColor: 'black',
            color: 'black',
            ':hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
              borderColor: 'black',
            },
          }}
          onClick={() => navigate("/enquiries")}
        >
          View Enquiries
        </Button>
      </Box>
    </Box>
  );
}

export default Dashboard;
