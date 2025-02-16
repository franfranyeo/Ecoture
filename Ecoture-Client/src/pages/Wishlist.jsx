import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getWishlist, removeFromWishlist } from 'utils/http';

import { Favorite } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';

function Wishlist() {
  const [wishlistItems, setWishlistItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    getWishlist()
      .then((res) => {
        console.log('Wishlist data:', res.data); // Debugging: Check API response
        // Ensure that if the data is not an array, we set it to an empty array
        setWishlistItems(res.data || []);
      })
      .catch((err) => {
        console.error('Error fetching wishlist:', err);
        setWishlistItems([]); // Set to empty array in case of error
      });
  }, []);

  const removeItem = (productId) => {
    removeFromWishlist(productId)
      .then(() =>
        setWishlistItems((prev) => prev.filter((item) => item.id !== productId))
      )
      .catch(() => toast.error('Failed to remove from wishlist'));
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Typography variant="h4" sx={{ marginBottom: 3, textAlign: 'center' }}>
        My Wishlist
      </Typography>

      {wishlistItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', padding: 4 }}>
          <Typography variant="h5" color="text.secondary" sx={{ marginBottom: 2 }}>
            Your wishlist is empty! 💔
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            Browse Products
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {wishlistItems.map((product) => (
            <Grid item xs={12} sm={6} md={4} key={product.id}>
              <Card sx={{ position: 'relative', padding: 2 }}>
                <IconButton
                  sx={{ position: 'absolute', top: 10, right: 10 }}
                  color="error"
                  onClick={() => removeItem(product.id)}
                >
                  <Favorite />
                </IconButton>

                <CardMedia
                  component="img"
                  height="200"
                  image={
                    product.imageFile
                      ? `${import.meta.env.VITE_FILE_BASE_URL}${product.imageFile}`
                      : '/placeholder.png'
                  }
                  alt={product.title || 'Product Image'}
                  onClick={() => navigate(`/product/${product.id}`)}
                  sx={{ cursor: 'pointer', objectFit: 'cover' }}
                />

                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    {product.title || 'No title available'} {/* Fallback title */}
                  </Typography>
                  <Typography variant="body1" color="primary">
                    {product.price ? `$${product.price.toFixed(2)}` : 'Price not available'} {/* Fallback price */}
                  </Typography>
                </CardContent>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  View Product
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Wishlist;
