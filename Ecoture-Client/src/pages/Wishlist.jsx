import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';

import FavoriteIcon from '@mui/icons-material/Favorite';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Typography,
} from '@mui/material';

import UserContext from '../contexts/UserContext';

function Wishlist() {
  const { user } = useContext(UserContext);
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      const response = await http.get('/wishlist');
      setWishlistProducts(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError('Failed to load wishlist.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  // Example of what the add to wishlist function should look like
const handleAddToWishlist = async (productId) => {
  try {
    await http.post('/wishlist', { productId });
    
    // Add this line to update the navbar count
    window.dispatchEvent(new Event('wishlistUpdated'));
    
    toast.success('Product added to wishlist!');
  } catch (error) {
    console.error('Error adding product to wishlist:', error);
    toast.error('Failed to add product to wishlist.');
  }
};

  

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await http.delete(`/wishlist/${productId}`);
      setWishlistProducts((prev) =>
        prev.filter((product) => product.productId !== productId)
      );

      // Dispatch the event
      window.dispatchEvent(new Event('wishlistUpdated'));
      console.log('Wishlist update event dispatched'); // Add this for debugging

      toast.success('Product removed from wishlist!');
    } catch (error) {
      console.error('Error removing product from wishlist:', error);
      toast.error('Failed to remove product from wishlist.');
    }
  };
  if (loading) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography>Loading wishlist...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 4, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ padding: 2 }}>
      <Typography
        variant="h4"
        sx={{
          marginBottom: 3,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        My Wishlist
      </Typography>

      {wishlistProducts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="text.secondary">
            Your wishlist is empty
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </Button>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 3,
            padding: 2,
          }}
        >
          {wishlistProducts.map((product) => (
            <Card
              key={product.productId}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                borderRadius: '12px',
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <CardMedia
                component="img"
                alt={product.productTitle}
                image={
                  product.productImage
                    ? `${import.meta.env.VITE_FILE_BASE_URL}${product.productImage}`
                    : '/placeholder.png'
                }
                sx={{
                  height: 200,
                  objectFit: 'cover',
                }}
              />

              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    mb: 1,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    lineHeight: 1.2,
                  }}
                >
                  {product.productTitle || 'Product Title not available'}
                </Typography>

                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 'bold', mb: 2 }}
                >
                  ${product.productPrice?.toFixed(2) || 'Price not available'}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    gap: 1,
                    flexDirection: 'column',
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => navigate(`/product/${product.productId}`)}
                  >
                    View Details
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    color="error"
                    onClick={() => handleRemoveFromWishlist(product.productId)}
                    startIcon={<FavoriteIcon />}
                  >
                    Remove
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default Wishlist;
