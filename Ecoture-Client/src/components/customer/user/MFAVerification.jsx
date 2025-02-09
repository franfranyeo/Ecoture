// components/MFAVerification.jsx
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";
import { authService } from "services/auth.service";
import { toast } from "react-toastify";

function MFAVerification({ userData, onCancel, onSuccess }) {
  const [mfaMethods, setMFAMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [otp, setOtp] = useState("");
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (!userData || !userData.mfaMethods) return;

    const { email, sms } = userData.mfaMethods;
    const methods = [];

    if (email) {
      methods.push("email");
    }
    if (sms) {
      methods.push("sms");
    }

    setMFAMethods(methods);
  }, [userData]);

  // handle auto select when only one method is available
  useEffect(() => {
    if (isInitialLoad && mfaMethods.length === 1) {
      handleMethodSelect(mfaMethods[0]);
      setIsInitialLoad(false);
    }
  }, [mfaMethods, isInitialLoad]);

  const handleMethodSelect = async (method) => {
    setSelectedMethod(method);
    try {
      await authService.sendMFACode({
        userId: userData.userId,
        email: userData.email,
        mobileNo: userData.mobileNo,
        method,
      });
      toast.success("Verification code sent successfully");
    } catch (error) {
      toast.error("Failed to send verification code");
      setSelectedMethod(null);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await authService.verifyMFACode({
        email: userData.email,
        method: selectedMethod,
        otp,
      });
      onSuccess(userData);
    } catch (error) {
      toast.error("Invalid verification code");
    }
  };

  return (
    <Box>
      {!selectedMethod ? (
        <List>
          {mfaMethods.map((method) => (
            <ListItem
              key={method}
              button
              onClick={() => handleMethodSelect(method)}
              sx={{
                border: "1px solid #ddd",
                borderRadius: "5px",
                mb: 1,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <ListItemText
                primary={
                  method === "email"
                    ? `Email (${userData.email})`
                    : `SMS (${userData.mobileNo})`
                }
              />
              <IconButton edge="end">
                <ArrowForward />
              </IconButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <Box>
          <Typography variant="h6" gutterBottom>
            Enter Verification Code
          </Typography>
          <TextField
            fullWidth
            label="Verification Code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            margin="normal"
          />
          <Box
            sx={{
              mt: 2,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button onClick={onCancel} sx={{ mr: 1 }}>
              Cancel
            </Button>
            <Button variant="contained" onClick={handleVerify} disabled={!otp}>
              Verify
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MFAVerification;
