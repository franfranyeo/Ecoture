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
        <Typography variant="h4">Edit Reward</Typography>
      </Box>
      <Paper elevation={3} sx={{ p: 3 }}>
        <form onSubmit={formik.handleSubmit}>
          {/* Reward Type */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Reward Type</InputLabel>
            <Select
              name="rewardType"
              value={formik.values.rewardType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.rewardType && Boolean(formik.errors.rewardType)
              }
            >
              <MenuItem value="Discount">Discount</MenuItem>
              <MenuItem value="FreeShipping">Free Shipping</MenuItem>
              <MenuItem value="Cashback">Cashback</MenuItem>
              <MenuItem value="Cashback">Charity</MenuItem>
            </Select>
            {formik.touched.rewardType && formik.errors.rewardType && (
              <FormHelperText error>{formik.errors.rewardType}</FormHelperText>
            )}
          </FormControl>

          {/* Reward Title */}
          <TextField
            fullWidth
            label="Reward Title"
            name="rewardTitle"
            value={formik.values.rewardTitle}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.rewardTitle && Boolean(formik.errors.rewardTitle)
            }
            helperText={formik.touched.rewardTitle && formik.errors.rewardTitle}
            margin="dense"
          />

          {/* Reward Description */}
          <TextField
            fullWidth
            label="Reward Description"
            name="rewardDescription"
            multiline
            rows={4}
            value={formik.values.rewardDescription}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.rewardDescription &&
              Boolean(formik.errors.rewardDescription)
            }
            helperText={
              formik.touched.rewardDescription &&
              formik.errors.rewardDescription
            }
            margin="dense"
          />

          {/* Reward Code */}
          <TextField
            fullWidth
            label="Reward Code"
            name="rewardCode"
            value={formik.values.rewardCode}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.rewardCode && Boolean(formik.errors.rewardCode)
            }
            helperText={formik.touched.rewardCode && formik.errors.rewardCode}
            margin="dense"
          />

          {/* Reward Percentage */}
          <TextField
            fullWidth
            label="Reward Percentage (%)"
            name="rewardPercentage"
            type="number"
            value={formik.values.rewardPercentage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.rewardPercentage &&
              Boolean(formik.errors.rewardPercentage)
            }
            helperText={
              formik.touched.rewardPercentage && formik.errors.rewardPercentage
            }
            margin="dense"
          />

          {/* Minimum Purchase Amount */}
          <TextField
            fullWidth
            label="Minimum Purchase Amount"
            name="minimumPurchaseAmount"
            type="number"
            value={formik.values.minimumPurchaseAmount}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.minimumPurchaseAmount &&
              Boolean(formik.errors.minimumPurchaseAmount)
            }
            helperText={
              formik.touched.minimumPurchaseAmount &&
              formik.errors.minimumPurchaseAmount
            }
            margin="dense"
          />

          {/* Maximum Discount Cap */}
          <TextField
            fullWidth
            label="Maximum Discount Cap"
            name="maximumDiscountCap"
            type="number"
            value={formik.values.maximumDiscountCap}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.maximumDiscountCap &&
              Boolean(formik.errors.maximumDiscountCap)
            }
            helperText={
              formik.touched.maximumDiscountCap &&
              formik.errors.maximumDiscountCap
            }
            margin="dense"
          />

          {/* Expiration Date */}
          <TextField
            fullWidth
            label="Expiration Date"
            name="expirationDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.expirationDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.expirationDate &&
              Boolean(formik.errors.expirationDate)
            }
            helperText={
              formik.touched.expirationDate && formik.errors.expirationDate
            }
            margin="dense"
          />

          {/* Start Date */}
          <TextField
            fullWidth
            label="Start Date"
            name="startDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formik.values.startDate}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.startDate && Boolean(formik.errors.startDate)}
            helperText={formik.touched.startDate && formik.errors.startDate}
            margin="dense"
          />

          {/* Usage Limit */}
          <TextField
            fullWidth
            label="Usage Limit"
            name="usageLimit"
            type="number"
            value={formik.values.usageLimit}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={
              formik.touched.usageLimit && Boolean(formik.errors.usageLimit)
            }
            helperText={formik.touched.usageLimit && formik.errors.usageLimit}
            margin="dense"
          />

          {/* Status */}
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.status && Boolean(formik.errors.status)}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
            {formik.touched.status && formik.errors.status && (
              <FormHelperText error>{formik.errors.status}</FormHelperText>
            )}
          </FormControl>
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
