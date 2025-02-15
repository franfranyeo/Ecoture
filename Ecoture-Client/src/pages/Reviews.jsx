import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import http from 'utils/http';

import { Cancel, Delete, Edit, Save } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputBase,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';

import UserContext from '../contexts/UserContext';

const Reviews = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext); // Access the signed-in user's context
  const [fetchedReviews, setFetchedReviews] = useState([]);
  const [editMode, setEditMode] = useState(null); // Track the review being edited
  const [editText, setEditText] = useState(''); // Track edited text
  const [editRating, setEditRating] = useState(1); // Track edited rating (default to 1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // State to control delete confirmation dialog
  const [reviewToDelete, setReviewToDelete] = useState(null); // Store the review being deleted

  // Fetch reviews for the specific product
  useEffect(() => {
    if (productId) {
      http
        .get(`/reviews/${productId}`)
        .then((res) => {
          setFetchedReviews(res.data);
        })
        .catch((err) => {
          console.error('Error fetching reviews:', err);
        });
    }
  }, [productId]);

  const handleDeleteReview = () => {
    if (reviewToDelete) {
      http
        .delete(`/reviews/${reviewToDelete.id}`)
        .then(() => {
          setFetchedReviews((prev) =>
            prev.filter((review) => review.id !== reviewToDelete.id)
          );
          setDeleteDialogOpen(false); // Close the dialog after deletion
        })
        .catch((err) => {
          console.error('Error deleting review:', err);
          alert('Failed to delete review. Please try again.');
        });
    }
  };

  const handleEditReview = (review) => {
    setEditMode(review.id);
    setEditText(review.comment);
    setEditRating(review.rating);
  };

  const handleSaveReview = (reviewId) => {
    const updatedReview = {
      comment: editText,
      rating: editRating,
    };

    http
      .put(`/reviews/${reviewId}`, updatedReview)
      .then(() => {
        setFetchedReviews((prev) =>
          prev.map((review) =>
            review.id === reviewId
              ? { ...review, comment: editText, rating: editRating }
              : review
          )
        );
        setEditMode(null);
      })
      .catch((err) => {
        console.error('Error updating review:', err);
        alert('Failed to update review. Please try again.');
      });
  };

  const handleCancelEdit = () => {
    setEditMode(null);
    setEditText('');
    setEditRating(1); // Reset rating to default value
  };

  const handleBackClick = () => {
    navigate('/');
  };

  // Open the delete confirmation dialog
  const openDeleteDialog = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  // Close the delete confirmation dialog without deleting
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setReviewToDelete(null);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 3 }}>
        Reviews for Product {productId}
      </Typography>

      {/* Back Button */}
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleBackClick}
        sx={{ marginBottom: 2 }}
      >
        Back to Home
      </Button>

      {/* Display reviews */}
      <Grid container spacing={2}>
        {fetchedReviews.length > 0 ? (
          fetchedReviews.map((review) => (
            <Grid item xs={12} key={review.id}>
              <Box
                sx={{
                  padding: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                {editMode === review.id ? (
                  // Edit mode UI
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <InputBase
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      placeholder="Edit your review..."
                      sx={{
                        width: '100%',
                        border: '1px solid #ccc',
                        borderRadius: '8px',
                        padding: '8px',
                      }}
                    />

                    {/* Rating Selection (dropdown) */}
                    <FormControl fullWidth>
                      <InputLabel>Rating</InputLabel>
                      <Select
                        value={editRating}
                        onChange={(e) => setEditRating(e.target.value)}
                        label="Rating"
                        sx={{
                          width: '100%',
                          padding: '8px',
                          borderRadius: '8px',
                        }}
                      >
                        <MenuItem value={1}>1</MenuItem>
                        <MenuItem value={2}>2</MenuItem>
                        <MenuItem value={3}>3</MenuItem>
                        <MenuItem value={4}>4</MenuItem>
                        <MenuItem value={5}>5</MenuItem>
                      </Select>
                    </FormControl>

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Save />}
                        onClick={() => handleSaveReview(review.id)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<Cancel />}
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  // Default view mode UI
                  <>
                    <Typography variant="body2">
                      <strong>{review.username}:</strong> {review.comment}
                    </Typography>
                    <Typography variant="caption">
                      Rating: {review.rating}/5
                    </Typography>
                  </>
                )}

                {/* Show Edit/Delete buttons for all signed-in users */}
                {user && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      display: 'flex',
                      gap: 1,
                    }}
                  >
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditReview(review)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => openDeleteDialog(review)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            No reviews yet.
          </Typography>
        )}
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this review?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteReview} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Reviews;
