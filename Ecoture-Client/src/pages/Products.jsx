import { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import http from 'utils/http';

import { Clear, Search } from '@mui/icons-material';
// Wishlist icon
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
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

// Filled Wishlist icon for toggle state

function Products({ onAddProductClick }) {
  const [productList, setProductList] = useState([]);
  const [search, setSearch] = useState('');
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState('');
  const [reviewFormOpen, setReviewFormOpen] = useState(null);

  const { categoryName } = useParams(); // Get category from URL
  const [selectedCategory, setSelectedCategory] = useState('');

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFit, setSelectedFit] = useState('');
  const [selectedPriceRange, setSelectedPriceRange] = useState('');

  const [wishlistStatus, setWishlistStatus] = useState({}); // Track wishlist status for each product

  const handleAddToWishlist = async (productId) => {
    if (!user) {
      toast.error('You must be logged in to add items to your wishlist.');
      return;
    }

    try {
      if (wishlistStatus[productId]) {
        // Remove from wishlist
        await http.delete(`/wishlist/${productId}`);
        setWishlistStatus((prev) => ({ ...prev, [productId]: false }));
        toast.success('Product removed from wishlist!');
      } else {
        // Add to wishlist
        await http.post('/wishlist', { productId });
        setWishlistStatus((prev) => ({ ...prev, [productId]: true }));
        toast.success('Product added to wishlist!');
      }

      // Dispatch the wishlistUpdated event to notify Navbar
      window.dispatchEvent(new Event('wishlistUpdated'));
    } catch (error) {
      console.error('Error handling wishlist operation:', error);
      toast.error('Failed to update wishlist.');
    }
  };

  useEffect(() => {
    if (user) {
      const fetchWishlistStatus = async () => {
        try {
          const response = await http.get('/wishlist');
          const wishlist = response.data.reduce((acc, item) => {
            acc[item.productId] = true;
            return acc;
          }, {});
          setWishlistStatus(wishlist);
        } catch (error) {
          console.error('Error fetching wishlist status:', error);
        }
      };
      fetchWishlistStatus();
    }
  }, [user]);

  useEffect(() => {
    setSelectedCategory(categoryName || ''); // Sync category from URL
  }, [categoryName]);

  const getProducts = () => {
    http
      .get('/product')
      .then((res) => {
        let filteredProducts = res.data;

        if (selectedCategory) {
          filteredProducts = filteredProducts.filter((product) => {
            if (!product.categories || product.categories.length === 0)
              return false;

            const categories = product.categories.map((c) =>
              c.categoryName.toLowerCase()
            );

            return categories.includes(selectedCategory.toLowerCase());
          });
        }

        if (selectedColor) {
          filteredProducts = filteredProducts.filter((product) =>
            product.sizeColors.some((sc) => sc.colorName === selectedColor)
          );
        }

        if (selectedSize) {
          filteredProducts = filteredProducts.filter((product) =>
            product.sizeColors.some((sc) => sc.sizeName === selectedSize)
          );
        }

        if (selectedFit) {
          filteredProducts = filteredProducts.filter((product) =>
            product.fits.some((fit) => fit.fitName === selectedFit)
          );
        }

        if (selectedPriceRange) {
          filteredProducts = filteredProducts.filter(
            (product) => product.priceRange === parseInt(selectedPriceRange, 10)
          );
        }

        setProductList(filteredProducts);
      })
      .catch((err) => {
        console.error('Error fetching products:', err);
      });
  };

  // Fetch products when category changes
  useEffect(() => {
    getProducts();
  }, [
    selectedCategory,
    selectedColor,
    selectedSize,
    selectedFit,
    selectedPriceRange,
  ]);

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);

    if (newCategory) {
      navigate(`/category/${newCategory}`);
    } else {
      navigate('/');
    }
  };

  const searchProducts = () => {
    const query = encodeURIComponent(search); // Safeguard against special characters
    http
      .get(`/product?search=${query}`)
      .then((res) => {
        setProductList(res.data);
      })
      .catch((err) => {
        console.error('Error searching products:', err);
      });
  };

  const onSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const onSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      searchProducts();
    }
  };

  const onClickSearch = () => {
    searchProducts();
  };

  const onClickClear = () => {
    setSearch('');
    getProducts();
  };

  const openDeleteDialog = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      http
        .delete(`/product/${productToDelete.id}`)
        .then(() => {
          setProductList((prev) =>
            prev.filter((product) => product.id !== productToDelete.id)
          );
          closeDeleteDialog();
        })
        .catch(() => {
          toast.error('Failed to delete product. Please try again.');
        });
    }
  };

  const getSizeRange = (sizeColors) => {
    if (!sizeColors || sizeColors.length === 0) return 'No sizes available';

    const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

    // Extract unique sizes, ignoring color variations
    const uniqueSizes = [
      ...new Set(sizeColors.map((item) => item.sizeName)),
    ].sort((a, b) => sizeOrder.indexOf(a) - sizeOrder.indexOf(b));

    if (uniqueSizes.length === 0) return 'Out of stock';
    if (uniqueSizes.length === 1) return `Size: ${uniqueSizes[0]}`;

    return `Sizes: ${uniqueSizes[0]} - ${uniqueSizes[uniqueSizes.length - 1]}`;
  };

  const toggleReviewForm = (productId, e) => {
    e.stopPropagation();
    setReviewFormOpen((prev) => (prev === productId ? null : productId));
  };

  const submitReview = (productId, e) => {
    e.stopPropagation();
    if (!reviewText || !reviewRating) {
      toast.error('Please provide valid review text and a rating.');
      return;
    }

    const reviewData = {
      productId,
      comment: reviewText,
      rating: reviewRating,
      username: user?.name || 'Anonymous',
    };

    http
      .post('/reviews', reviewData)
      .then(() => {
        setReviewText('');
        setReviewRating('');
        setReviewFormOpen(null);
      })
      .catch((err) => {
        console.error('Error adding review:', err);
        toast.error('Failed to add review. Please try again.');
      });
  };

  const viewReviews = (productId, e) => {
    e.stopPropagation();
    navigate(`/reviews/${productId}`);
  };

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
        Our Products
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 2,
          marginBottom: 3,
          padding: '16px 24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '12px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.08)',
        }}
      >
        {/* Category Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '6px',
            }}
          >
            Category
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedCategory}
              onChange={handleCategoryChange}
              displayEmpty
              sx={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f4f4f4' },
              }}
            >
              <MenuItem value="">All Categories</MenuItem>
              <MenuItem value="Men">Men</MenuItem>
              <MenuItem value="Women">Women</MenuItem>
              <MenuItem value="Trending">Trending</MenuItem>
              <MenuItem value="New Arrivals">New Arrivals</MenuItem>
              <MenuItem value="Boys">Boys</MenuItem>
              <MenuItem value="Girls">Girls</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Color Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '6px',
            }}
          >
            Color
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              displayEmpty
              sx={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f4f4f4' },
              }}
            >
              <MenuItem value="">All Colors</MenuItem>
              {Array.from(
                new Set(
                  productList.flatMap(
                    (product) =>
                      product.sizeColors?.map((sc) => sc.colorName) || []
                  )
                )
              ).map((color, index) => (
                <MenuItem key={index} value={color}>
                  {color}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Size Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '6px',
            }}
          >
            Size
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
              displayEmpty
              sx={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f4f4f4' },
              }}
            >
              <MenuItem value="">All Sizes</MenuItem>
              <MenuItem value="S">S</MenuItem>
              <MenuItem value="M">M</MenuItem>
              <MenuItem value="L">L</MenuItem>
              <MenuItem value="XL">XL</MenuItem>
              <MenuItem value="XXL">XXL</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Fit Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '6px',
            }}
          >
            Fit
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedFit}
              onChange={(e) => setSelectedFit(e.target.value)}
              displayEmpty
              sx={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f4f4f4' },
              }}
            >
              <MenuItem value="">All Fits</MenuItem>
              <MenuItem value="Regular Tapered">Regular Tapered</MenuItem>
              <MenuItem value="Skinny Tapered">Skinny Tapered</MenuItem>
              <MenuItem value="Seasonal Fit">Seasonal Fit</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Price Filter */}
        <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 200 }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '6px',
            }}
          >
            Price Range
          </Typography>
          <FormControl fullWidth>
            <Select
              value={selectedPriceRange}
              onChange={(e) => setSelectedPriceRange(e.target.value)}
              displayEmpty
              sx={{
                padding: '10px',
                borderRadius: '8px',
                backgroundColor: '#fff',
                '&:hover': { backgroundColor: '#f4f4f4' },
              }}
            >
              <MenuItem value="">All Prices</MenuItem>
              <MenuItem value="1">$10 - $20</MenuItem>
              <MenuItem value="2">$20 - $30</MenuItem>
              <MenuItem value="3">$30 - $40</MenuItem>
              <MenuItem value="4">$40 - $50</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 4,
          gap: 1,
        }}
      >
        <InputBase
          value={search}
          placeholder="Search for products..."
          onChange={onSearchChange}
          onKeyDown={onSearchKeyDown}
          sx={{
            border: '1px solid #ccc',
            borderRadius: '50px',
            padding: '0.5rem 1rem',
            flex: 1,
            maxWidth: 400,
          }}
        />
        <IconButton color="primary" onClick={onClickSearch}>
          <Search />
        </IconButton>
        <IconButton color="secondary" onClick={onClickClear}>
          <Clear />
        </IconButton>
        {user && user.role && user.role == 'Admin' && (
          <Button
            variant="contained"
            color="primary"
            onClick={onAddProductClick}
            sx={{ borderRadius: '50px' }}
          >
            Add Product
          </Button>
        )}
      </Box>

      {productList.length > 0 ? (
        <Grid container spacing={4}>
          {productList.map((product) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  borderRadius: '12px',
                  boxShadow: 'none',
                  border: '1px solid #e0e0e0',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                  },
                }}
                onClick={(e) => e.stopPropagation()} // <-- Prevent navigation when clicking on card
              >
                {product.imageFile && (
                  <CardMedia
                    component="img"
                    alt="Product Image"
                    image={`${import.meta.env.VITE_FILE_BASE_URL}${
                      product.imageFile
                    }`}
                    sx={{ height: 250, objectFit: 'cover' }}
                  />
                )}
                <CardContent>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                  >
                    {product.sizeColors?.length > 0 && (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ fontWeight: 'bold', marginBottom: 0.5 }}
                        >
                          Available Sizes:
                        </Typography>
                        <Typography variant="body2" color="text.primary">
                          {getSizeRange(product.sizeColors)}
                        </Typography>
                      </Box>
                    )}

                    {/* Display price */}
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 'bold', marginBottom: 1 }}
                    >
                      {product.title}
                    </Typography>

                    {/* Discounted price */}
                    {product.discountedPrice ? (
                      <Box>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            textDecoration: 'line-through',
                            fontSize: '0.9rem',
                          }}
                        >
                          ${product.originalPrice?.toFixed(2)}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="primary"
                          sx={{ fontWeight: 'bold' }}
                        >
                          ${product.discountedPrice.toFixed(2)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography
                        variant="h6"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      >
                        ${product.price?.toFixed(2)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
                {/* Wishlist Button */}
                <Button
                  variant="outlined"
                  color={wishlistStatus[product.id] ? 'secondary' : 'primary'}
                  startIcon={
                    wishlistStatus[product.id] ? (
                      <FavoriteIcon />
                    ) : (
                      <FavoriteBorderIcon />
                    )
                  }
                  onClick={(e) => handleAddToWishlist(product.id, e)} // <-- Pass the event to handleAddToWishlist
                  sx={{ marginTop: 1 }}
                >
                  {wishlistStatus[product.id]
                    ? 'Remove from Wishlist'
                    : 'Add to Wishlist'}
                </Button>

                <Box sx={{ padding: 2 }}>
                  {user && (
                    <Button
                      variant="text"
                      color="primary"
                      onClick={(e) => toggleReviewForm(product.id, e)}
                      sx={{ marginTop: 1 }}
                    >
                      {reviewFormOpen === product.id
                        ? 'Cancel'
                        : 'Write a Review'}
                    </Button>
                  )}

                  {reviewFormOpen === product.id && (
                    <Box
                      sx={{ marginTop: 2 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <InputBase
                        placeholder="Write your review..."
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        sx={{
                          border: '1px solid #ccc',
                          borderRadius: '8px',
                          padding: '0.5rem',
                          marginBottom: 1,
                          width: '100%',
                        }}
                      />
                      <FormControl
                        sx={{
                          minWidth: 120,
                          marginBottom: 1,
                        }}
                      >
                        <InputLabel id="rating-label">Rating</InputLabel>
                        <Select
                          labelId="rating-label"
                          value={reviewRating}
                          onChange={(e) => setReviewRating(e.target.value)}
                        >
                          <MenuItem value={1}>1</MenuItem>
                          <MenuItem value={2}>2</MenuItem>
                          <MenuItem value={3}>3</MenuItem>
                          <MenuItem value={4}>4</MenuItem>
                          <MenuItem value={5}>5</MenuItem>
                        </Select>
                      </FormControl>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={(e) => submitReview(product.id, e)}
                      >
                        Submit
                      </Button>
                    </Box>
                  )}
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={(e) => viewReviews(product.id, e)}
                    sx={{ marginTop: 2 }}
                  >
                    View All Reviews
                  </Button>
                </Box>

                {user && user.role && user.role == 'Admin' && (
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: 1,
                    }}
                  >
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/editproduct/${product.id}`);
                      }}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDeleteDialog(product);
                      }}
                      sx={{ fontSize: '0.8rem' }}
                    >
                      Delete
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ textAlign: 'center', marginTop: 4 }}
        >
          No products found in this category.
        </Typography>
      )}

      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={closeDeleteDialog}
            color="inherit"
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDeleteProduct}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Products;
