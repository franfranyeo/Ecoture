import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import http from "utils/http";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  Avatar,
  IconButton,
  Divider,
} from "@mui/material";
import { useFormik } from "formik";
import * as yup from "yup";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ArrowBack } from "@mui/icons-material";

function EditReward() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [reward, setReward] = useState(null);

  useEffect(() => {
    http.get(`/rewards/${id}`).then((res) => {
      setReward(res.data);
      setLoading(false);
    });
  }, [id]);

  const validationSchema = yup.object().shape({
    rewardType: yup.string().required("Reward type is required"),
    rewardTitle: yup
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(100, "Title cannot exceed 100 characters")
      .required("Title is required"),
    rewardDescription: yup
      .string()
      .trim()
      .min(10, "Description must be at least 10 characters")
      .max(500, "Description cannot exceed 500 characters")
      .required("Description is required"),
    rewardCode: yup
      .string()
      .trim()
      .min(3, "Code must be at least 3 characters")
      .max(20, "Code cannot exceed 20 characters")
      .required("Code is required"),
    rewardPercentage: yup
      .number()
      .min(0, "Percentage must be at least 0")
      .max(100, "Percentage cannot exceed 100")
      .required("Percentage is required"),
    minimumPurchaseAmount: yup
      .number()
      .min(0, "Minimum purchase amount must be at least 0")
      .required("Minimum purchase amount is required"),
    maximumDiscountCap: yup
      .number()
      .min(0, "Maximum discount cap must be at least 0")
      .required("Maximum discount cap is required"),
    expirationDate: yup.date().required("Expiration date is required"),
    startDate: yup.date().required("Start date is required"),
    usageLimit: yup
      .number()
      .min(1, "Usage limit must be at least 1")
      .required("Usage limit is required"),
    status: yup
      .string()
      .oneOf(["Active", "Inactive"])
      .required("Status is required"),
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      rewardType: reward?.rewardType || "",
      rewardTitle: reward?.rewardTitle || "",
      rewardDescription: reward?.rewardDescription || "",
      rewardCode: reward?.rewardCode || "",
      rewardPercentage: reward?.rewardPercentage || 0,
      minimumPurchaseAmount: reward?.minimumPurchaseAmount || 0,
      maximumDiscountCap: reward?.maximumDiscountCap || 0,
      expirationDate: reward?.expirationDate || null,
      startDate: reward?.startDate || null,
      usageLimit: reward?.usageLimit || 1,
      status: reward?.status || "Active",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await http.put(`/rewards/${id}`, values);
        console.log("Reward updated successfully:", response.data);
        toast.success("Reward updated successfully");
        navigate("/admin/rewards");
      } catch (error) {
        console.error("Error updating reward:", error);
        toast.error("Failed to update reward");
      }
    },
  });

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <IconButton
          sx={{ cursor: "pointer" }}
          onClick={() => navigate(`/admin/rewards/${id}/view`)}
        >
          <ArrowBack fontSize="large" />
        </IconButton>
        <Typography variant="h4">Edit User</Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          {/* Similar form fields as in AddReward */}
          {/* Include all fields from AddReward here */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            Update Reward
          </Button>
        </form>
      </Paper>
    </>
  );
}

export default EditReward;
