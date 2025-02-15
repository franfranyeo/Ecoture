import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid2,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import http from "utils/http";

function Dashboard() {
  const [enquiryStats, setEnquiryStats] = useState({
    total: 0,
    open: 0,
    closed: 0,
    inProgress: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    http
      .get("/Enquiry/Summary")
      .then((res) => {
        setEnquiryStats(res.data);
      })
      .catch((err) => console.error("Error fetching enquiry summary:", err));
  }, []);

  return (
    <Box
      sx={{
        padding: "40px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
      }}
    >
      <Grid2
        container
        spacing={3}
        sx={{
          width: "100%",
          maxWidth: "1200px",
          justifyContent: "center",
        }}
      >
        {[
          {
            title: "Total Enquiries",
            count: enquiryStats.total,
            bgColor: "#e3f2fd",
          },
          { title: "Open", count: enquiryStats.open, bgColor: "#c8e6c9" },
          { title: "Closed", count: enquiryStats.closed, bgColor: "#ffcdd2" },
          {
            title: "In Progress",
            count: enquiryStats.inProgress,
            bgColor: "#fff9c4",
          },
        ].map((stat, index) => (
          <Grid2 xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                backgroundColor: stat.bgColor,
                textAlign: "center",
                boxShadow: 3,
                padding: "20px",

                width: "200px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {stat.title}
                </Typography>
                <Typography variant="h4">{stat.count}</Typography>
              </CardContent>
            </Card>
          </Grid2>
        ))}
      </Grid2>

      <Box
        sx={{
          marginTop: "40px",
          display: "flex",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <Button
          variant="outlined"
          color="primary"
          sx={{
            textTransform: "none",
            fontSize: "1rem",
            borderColor: "black",
            color: "black",
            ":hover": {
              backgroundColor: "rgba(0, 0, 0, 0.04)",
              borderColor: "black",
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
