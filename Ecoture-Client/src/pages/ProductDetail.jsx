import { useEffect, useState } from 'react';
import { useContext } from 'react';
import ReactImageMagnify from 'react-image-magnify';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';

import { ArrowBack } from '@mui/icons-material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Box, Button, Chip, Grid, Typography } from '@mui/material';

import UserContext from '../contexts/UserContext';

// Import UserContext

// Wishlist icon

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const navigate = useNavigate();

  const priceRangeLabels = {
    1: '$10-$20',
    2: '$20-$30',
    3: '$30-$40',
    4: '$40-$50',
    5: '$50+',
  };

  // Use this hook at the top of your component
  const { user } = useContext(UserContext);
  const [wishlistStatus, setWishlistStatus] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (user && product) {
      const fetchWishlistStatus = async () => {
        try {
          const response = await http.get('/wishlist');
          const productInWishlist = response.data.some(
            (item) => item.productId === product.id
          );
          setWishlistStatus(productInWishlist);
        } catch (error) {
          console.error('Error checking wishlist status:', error);
        }
      };
      fetchWishlistStatus();
    }
  }, [user, product]);

  const handleAddToWishlist = async () => {
    if (!user) {
      toast.error('You must be logged in to add items to your wishlist.');
      return;
    }

    try {
      if (wishlistStatus) {
        // Remove from wishlist
        await http.delete(`/wishlist/${product.id}`);
        setWishlistStatus(false);
        toast.success('Product removed from wishlist!');
      } else {
        // Add to wishlist
        await http.post('/wishlist', { productId: product.id });
        setWishlistStatus(true);
        toast.success('Product added to wishlist!');
      }

      // Dispatch a custom event to notify the Navbar
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error handling wishlist operation:', error);
      toast.error('Failed to update wishlist.');
    }
  };

  useEffect(() => {
    setLoading(true);
    http
      .get(`/product/${id}`)
      .then((res) => {
        setProduct(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching product details:', err);
        setError('Failed to load product details.');
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = async () => {
    if (!selectedColor || !selectedSize) {
      toast.error('Please select a color and size before adding to cart.');
      return;
    }

    const cartItem = {
      productId: product.id,
      productTitle: product.title,
      price: product.price,
      color: selectedColor,
      size: selectedSize,
      imageFile: product.imageFile || '', // Ensure it's not null
      quantity: quantity,
    };

    try {
      const response = await http.post('/cart', cartItem, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        toast.success('Item added to cart successfully!');
      } else {
        toast.error('Failed to add item to cart.');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart.');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box sx={{ padding: '80px 16px 16px' }}>
      <Box sx={{ display: 'flex', gap: 2, marginBottom: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: '#fff',
            color: 'black',
            borderColor: '#ccc',
            '&:hover': {
              backgroundColor: '#f9f9f9',
              borderColor: '#aaa',
            },
          }}
        >
          Back to Products
        </Button>

        <Button
          variant="outlined"
          color={wishlistStatus ? 'secondary' : 'primary'}
          sx={{
            padding: '0.75rem 1.5rem',
            fontWeight: 'bold',
            borderRadius: '8px',
          }}
          onClick={handleAddToWishlist}
        >
          {wishlistStatus ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </Button>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Grid item xs={12} md={6}>
            <Box sx={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
              <ReactImageMagnify
                {...{
                  smallImage: {
                    alt: product.title || 'Product Image',
                    isFluidWidth: false,
                    width: 600,
                    height: 750, // Reduced height
                    src: product.imageFile
                      ? `${import.meta.env.VITE_FILE_BASE_URL}${
                          product.imageFile
                        }`
                      : '/placeholder.png',
                    style: { borderRadius: '10px' }, // Rounded edges
                  },
                  largeImage: {
                    src: product.imageFile
                      ? `${import.meta.env.VITE_FILE_BASE_URL}${
                          product.imageFile
                        }`
                      : '/placeholder.png',
                    width: 1000, // Adjusted zoom size
                    height: 1500,
                    style: { borderRadius: '10px' }, // Rounded edges
                  },
                  enlargedImageContainerStyle: {
                    background: '#fff',
                    zIndex: 10,
                  },
                  enlargedImagePosition: 'beside',
                  lensStyle: {
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    border: '1px solid black',
                  },
                  isHintEnabled: true, // Enables cursor hint
                  hintTextMouse: 'Zoom', // Adds a zoom hint
                  style: { cursor: 'zoom-in' }, // **Ensures cursor change on hover**
                }}
              />
            </Box>
          </Grid>

          {product.longDescription && (
            <Box sx={{ marginTop: 2 }}>
              <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                Detailed Description:
              </Typography>
              <Typography
                variant="body2"
                sx={{ whiteSpace: 'pre-wrap', marginTop: 1 }}
              >
                {product.longDescription}
              </Typography>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', marginBottom: 2 }}>
            {product.title}
          </Typography>
          <Typography variant="h5" color="primary" sx={{ marginBottom: 2 }}>
            ${product.price?.toFixed(2) || 'N/A'}
          </Typography>
          <Typography variant="body1" sx={{ marginBottom: 2 }}>
            {product.description}
          </Typography>

          {/* Categories Section */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              marginBottom: 1,
              color: '#555', // Slightly darker text to contrast with the background
            }}
          >
            Categories:
          </Typography>
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}
          >
            {product.categories?.map((category, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  backgroundColor: 'transparent', // No background to avoid button-like effect
                  padding: '5px 10px', // Subtle padding for spacing
                  borderRadius: '10px', // Slightly rounded for a more clean, soft look
                  color: '#333', // Darker text for readability
                  fontWeight: 'normal', // Not bold to avoid button-like feel
                  border: '1px solid #ccc', // Add subtle border for distinction
                }}
              >
                {category.categoryName}
              </Typography>
            ))}
          </Box>

          {/* Fits Section */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              marginBottom: 1,
              color: '#555',
            }}
          >
            Fits:
          </Typography>
          <Box
            sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, marginBottom: 2 }}
          >
            {product.fits && product.fits.length > 0 ? (
              product.fits.map((fit, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    backgroundColor: 'transparent', // No background
                    padding: '5px 10px', // Subtle padding for spacing
                    borderRadius: '10px', // Rounded corners
                    color: '#333', // Dark text color for better readability
                    fontWeight: 'normal', // Normal weight text
                    border: '1px solid #ccc', // Subtle border to differentiate
                  }}
                >
                  {fit.fitName}
                </Typography>
              ))
            ) : (
              <Typography variant="body2">No fits available</Typography>
            )}
          </Box>

          {/* Price Range Section */}
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', marginBottom: 2 }}
          >
            Price Range: {priceRangeLabels[product.priceRange] || 'N/A'}
          </Typography>

          {/* Color Selection */}
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', marginBottom: 1 }}
          >
            Select Color:
          </Typography>
          <Box
            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginBottom: 2 }}
          >
            {/* Extract unique colors from SizeColors */}
            {product.sizeColors && product.sizeColors.length > 0 ? (
              [
                ...new Set(product.sizeColors.map((item) => item.colorName)),
              ].map((color, index) => (
                <Chip
                  key={index}
                  label={color}
                  color={selectedColor === color ? 'secondary' : 'default'}
                  sx={{
                    backgroundColor:
                      selectedColor === color ? 'green' : '#f0f0f0',
                    color: selectedColor === color ? '#fff' : '#555',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor:
                        selectedColor === color ? 'green' : '#e0e0e0',
                    },
                  }}
                  onClick={() => {
                    setSelectedColor(color); // Select the new color
                    setSelectedSize(null); // Reset size when color changes
                  }}
                />
              ))
            ) : (
              <Typography variant="body2">No colors available</Typography>
            )}
          </Box>

          {/* Size Selection */}
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', marginBottom: 1 }}
          >
            Select Size:
          </Typography>
          <Box
            sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginBottom: 2 }}
          >
            {/* Filter unique sizes for the selected color */}
            {selectedColor ? (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {/* Aggregate the stock quantities for each size and color */}
                {[
                  ...new Map(
                    product.sizeColors
                      .filter((item) => item.colorName === selectedColor)
                      .map((size) => [size.sizeName, size]) // Ensures unique sizes
                  ).values(),
                ].map((size, index) => {
                  // Aggregate stock quantities for the same size and color combination
                  const totalStock = product.sizeColors
                    .filter(
                      (item) =>
                        item.sizeName === size.sizeName &&
                        item.colorName === selectedColor
                    )
                    .reduce((sum, item) => sum + item.stockQuantity, 0); // Sum stock quantities

                  return (
                    <Chip
                      key={index}
                      label={`${size.sizeName} (${totalStock} in stock)`} // Display aggregated quantity
                      color={
                        selectedSize === size.sizeName ? 'secondary' : 'default'
                      }
                      sx={{
                        backgroundColor:
                          selectedSize === size.sizeName ? 'green' : '#f0f0f0',
                        color: selectedSize === size.sizeName ? '#fff' : '#555',
                        cursor: 'pointer',
                        '&:hover': {
                          backgroundColor:
                            selectedSize === size.sizeName
                              ? 'green'
                              : '#e0e0e0',
                        },
                      }}
                      onClick={() => setSelectedSize(size.sizeName)}
                    />
                  );
                })}
              </Box>
            ) : (
              <Typography variant="body2">Select a color first</Typography>
            )}
          </Box>

          {/* Quantity Selection */}
          <Typography
            variant="body2"
            sx={{ fontWeight: 'bold', marginBottom: 1 }}
          >
            Quantity:
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              marginBottom: 2,
            }}
          >
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
            >
              -
            </Button>
            <Typography variant="body1">{quantity}</Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setQuantity(quantity + 1)}
            >
              +
            </Button>
          </Box>

          {/* Add to Cart Button */}
          <Button
            variant="contained"
            color="success"
            sx={{
              marginTop: 2,
              padding: '0.75rem 1.5rem',
              fontWeight: 'bold',
              borderRadius: '8px',
            }}
            disabled={
              !selectedColor ||
              !selectedSize ||
              quantity >
                product.sizeColors.find(
                  (item) =>
                    item.colorName === selectedColor &&
                    item.sizeName === selectedSize
                )?.stockQuantity
            }
            onClick={handleAddToCart} // Call function when clicked
          >
            Add to Cart
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}

export default ProductDetail;
