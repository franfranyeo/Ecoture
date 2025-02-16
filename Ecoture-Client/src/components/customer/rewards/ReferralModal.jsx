// ReferralModal.js
import React, { useState } from 'react';

import { Close, ContentCopy } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';

const ReferralModal = ({ open, onClose, referralCode }) => {
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setShowCopiedMessage(true);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleCloseCopiedMessage = () => {
    setShowCopiedMessage(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Share Your Referral Link</Typography>
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Share this link with your friends and earn points when they make
            their first purchase!
          </Typography>

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              value={referralLink}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <IconButton onClick={handleCopyLink} size="small">
                    <ContentCopy />
                  </IconButton>
                ),
              }}
              sx={{ bgcolor: 'grey.50' }}
            />
          </Box>

          <Typography variant="body2" color="text.secondary">
            Your referral code: <strong>{referralCode}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Close
          </Button>
          <Button
            onClick={handleCopyLink}
            variant="contained"
            color="primary"
            startIcon={<ContentCopy />}
          >
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showCopiedMessage}
        autoHideDuration={3000}
        onClose={handleCloseCopiedMessage}
        message="Referral link copied to clipboard!"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
};

export default ReferralModal;
