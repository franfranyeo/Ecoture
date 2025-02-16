import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';

import { ArrowBack, Edit } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';

function ViewReward() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
    timeZone: 'GMT',
  };

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const response = await http.get(`/rewards/${id}`);
        const cleanedReward = {
          ...response.data,
          expirationDate: response.data.expirationDate
            ? new Date(response.data.expirationDate).toLocaleDateString(
                'en-US',
                options
              )
            : 'Not set',
          startDate: response.data.startDate
            ? new Date(response.data.startDate).toLocaleDateString(
                'en-US',
                options
              )
            : 'Not set',
          createdAt: new Date(response.data.createdAt).toLocaleDateString(
            'en-US',
            options
          ),
          updatedAt: new Date(response.data.updatedAt).toLocaleDateString(
            'en-US',
            options
          ),
        };
        setReward(cleanedReward);
      } catch (error) {
        console.error('Error fetching reward:', error);
        toast.error('Failed to fetch reward');
      } finally {
        setLoading(false);
      }
    };
    fetchReward();
  }, [id]);

  const handleEdit = () => {
    navigate(`/admin/rewards/${id}/edit`);
  };

  const handleDelete = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const deleteReward = async () => {
    try {
      await http.delete(`/rewards/${id}`);
      toast.success('Reward deleted successfully');
      navigate('/admin/rewards');
    } catch (error) {
      console.error('Error deleting reward:', error);
      toast.error('Failed to delete reward');
    } finally {
      setOpen(false);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  if (!reward) {
    return <Typography>No reward found.</Typography>;
  }

  return (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin/rewards')}>
          <ArrowBack fontSize="large" />
        </IconButton>
        <Typography variant="h4">View Reward</Typography>
      </Box>

      {/* Main Content */}
      <Paper elevation={3} sx={{ p: 4, borderRadius: 3, position: 'relative' }}>
        {/* Edit Icon in Top Right Corner */}
        <IconButton
          onClick={handleEdit}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
          }}
        >
          <Edit />
        </IconButton>

        {/* Reward Image and Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: '500' }}>
              {reward.rewardTitle}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {reward.rewardType}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Reward Details */}
        <Typography variant="h6" gutterBottom>
          Reward Details
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Reward Code:</strong> {reward.rewardCode}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Reward Percentage:</strong> {reward.rewardPercentage}%
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Minimum Purchase Amount:</strong> $
              {reward.minimumPurchaseAmount.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Maximum Discount Cap:</strong> $
              {reward.maximumDiscountCap.toFixed(2)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Expiration Date:</strong> {reward.expirationDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Start Date:</strong> {reward.startDate}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Usage Limit:</strong> {reward.usageLimit}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Status:</strong> {reward.status}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Applicability Section */}
        <Typography variant="h6" gutterBottom>
          Applicability
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Applicable Products:</strong>{' '}
              {reward.applicableProducts || 'All Products'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Exclusions:</strong> {reward.exclusions || 'None'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>User Eligibility:</strong>{' '}
              {reward.userEligibility || 'All Users'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Stackable:</strong> {reward.isStackable ? 'Yes' : 'No'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Auto Apply:</strong> {reward.autoApply ? 'Yes' : 'No'}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Account Activity Section */}
        <Typography variant="h6" gutterBottom>
          Reward Activity
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Created At:</strong> {reward.createdAt}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body1">
              <strong>Updated At:</strong> {reward.updatedAt}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        {/* Delete Reward Section */}
        <Box marginTop={3}>
          <Typography variant="h6" color="error">
            Delete Reward
          </Typography>
          <Typography variant="body2" color="textSecondary" mt={1}>
            Deleting this reward will not delete any associated user data.
          </Typography>
          <Button
            variant="contained"
            color="error"
            sx={{ mt: 2 }}
            onClick={handleDelete}
          >
            Delete Reward
          </Button>
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle sx={{ color: '#e2160f', fontWeight: 'bold' }}>
          {'Delete Reward?'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Are you sure you want to delete this reward? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteReward} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ViewReward;
