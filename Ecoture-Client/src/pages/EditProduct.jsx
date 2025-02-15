import { useFormik } from 'formik';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import http from 'utils/http';
import * as yup from 'yup';

import { ArrowBack } from '@mui/icons-material';
import { AddCircleOutline, RemoveCircleOutline } from '@mui/icons-material';
import {
  Box,
  Button,
  Card,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { Chip } from '@mui/material';

function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [colors, setColors] = useState([]); // State for colors
  const [colorInput, setColorInput] = useState(''); // State for input color

  // Function to add a color to the list
  const addColor = () => {
    if (colorInput.trim() && !colors.includes(colorInput.trim())) {
      setColors([...colors, colorInput.trim()]); // Ensure colors is an array of strings
      setColorInput('');
    }
  };

  // Function to remove a color from the list
  const removeColor = (colorToRemove) => {
    setColors(colors.filter((color) => color !== colorToRemove));
  };

  const [sizes, setSizes] = useState([{ sizeName: '', stockQuantity: '' }]);

  const priceRangeMap = {
    1: '$10-$20',
    2: '$20-$30',
    3: '$30-$40',
    4: '$40-$50',
    5: '$50+',
  };

  // const reversePriceRangeMap = Object.fromEntries(
  //   Object.entries(priceRangeMap).map(([k, v]) => [v, parseInt(k)])
  // );

  // CHANGE FROM (around line 83 in EditProduct.jsx):
  useEffect(() => {
    http
      .get(`/product/${id}`)
      .then((res) => {
        const data = res.data;

        // Function to determine price range based on price
        const determinePriceRange = (price) => {
          if (price <= 20) return 1;
          if (price <= 30) return 2;
          if (price <= 40) return 3;
          if (price <= 50) return 4;
          return 5;
        };

        // Assign calculated priceRange
        const computedPriceRange = determinePriceRange(data.price);

        setProduct({
          ...data,
          priceRange: computedPriceRange,
          fits: data.fits ? data.fits.map((f) => f.fitName) : [],
          categories: data.categories
            ? data.categories.map((c) => c.categoryName)
            : [],
        });

        // Set image and sizes
        setImageFile(data.imageFile);

        setSizes(
          (data.SizeColors || []).map((size) => ({
            sizeName: size.sizeName || '',
            stockQuantity: size.stockQuantity || 0,
            selectedColor: size.colorName || '',
          }))
        );

        setColors(
          data.SizeColors
            ? [...new Set(data.SizeColors.map((size) => size.colorName))]
            : []
        );

        setLoading(false);
      })
      .catch(() => {
        toast.error('Failed to load product data.');
        setLoading(false);
      });
  }, [id]);

  // TO:
  useEffect(() => {
    http
      .get(`/product/${id}`)
      .then((res) => {
        const data = res.data;
        console.log('API Response:', data); // Add this for debugging

        // Function to determine price range based on price
        const determinePriceRange = (price) => {
          if (price <= 20) return 1;
          if (price <= 30) return 2;
          if (price <= 40) return 3;
          if (price <= 50) return 4;
          return 5;
        };

        // Assign calculated priceRange
        const computedPriceRange = determinePriceRange(data.price);

        setProduct({
          ...data,
          priceRange: computedPriceRange,
          fits: data.fits ? data.fits.map((f) => f.fitName) : [],
          categories: data.categories
            ? data.categories.map((c) => c.categoryName)
            : [],
        });

        // Set image
        setImageFile(data.imageFile);

        // Set sizes with their colors and quantities
        if (data.sizeColors && data.sizeColors.length > 0) {
          setSizes(
            data.sizeColors.map((item) => ({
              sizeName: item.sizeName,
              stockQuantity: item.stockQuantity,
              selectedColor: item.colorName,
            }))
          );

          // Extract unique colors from sizeColors
          const uniqueColors = [
            ...new Set(data.sizeColors.map((item) => item.colorName)),
          ];
          setColors(uniqueColors);
        } else {
          // If no existing data, set default empty state
          setSizes([{ sizeName: '', stockQuantity: '', selectedColor: '' }]);
          setColors([]);
        }

        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading product:', error);
        toast.error('Failed to load product data.');
        setLoading(false);
      });
  }, [id]);

  const formik = useFormik({
    initialValues: {
      title: product.title || '',
      description: product.description || '',
      longDescription: product.longDescription || '',
      price: product.price || '',
      categories: product.categories || [],
      fits: product.fits || [],
    },

    enableReinitialize: true,
    validationSchema: yup.object({
      title: yup
        .string()
        .trim()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title must be at most 100 characters')
        .required('Title is required'),
      description: yup
        .string()
        .trim()
        .min(3, 'Description must be at least 3 characters')
        .max(500, 'Description must be at most 500 characters')
        .required('Description is required'),
      longDescription: yup
        .string()
        .trim()
        .min(3, 'Long description must be at least 3 characters')
        .max(1000, 'Long description must be at most 1000 characters')
        .required('Long description is required'),
      price: yup
        .number()
        .min(0.01, 'Price must be greater than zero')
        .required('Price is required'),
      categories: yup.array().min(1, 'At least one category is required'),
      fits: yup.array().min(1, 'At least one fit is required'),
    }),

    onSubmit: (values) => {
      const requestBody = {
        title: values.title,
        description: values.description,
        longDescription: values.longDescription,
        price: parseFloat(values.price),
        categories: values.categories,
        fits: values.fits,
        imageFile: imageFile,
        SizeColors: sizes.map((s) => ({
          sizeName: s.sizeName.trim(),
          stockQuantity: parseInt(s.stockQuantity, 10),
          colorName: s.selectedColor,
        })),
        colors: colors,
      };

      // Make the API call to update the product
      http
        .put(`/product/${id}`, requestBody)
        .then((response) => {
          toast.success('Product updated successfully!');
          navigate('/'); // Redirect after success
        })
        .catch((error) => {
          toast.error(
            error.response?.data?.message || 'Failed to update product'
          );
        });
    },
  });

  const onFileChange = (e) => {
    setImageError('');
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setImageError('Maximum file size is 1MB');
        return;
      }

      const formData = new FormData();
      formData.append('file', file);
      setIsUploading(true);
      http
        .post('/file/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        .then((res) => {
          setImageFile(res.data.filename);
          setIsUploading(false);
        })
        .catch(() => {
          setImageError('Failed to upload image. Please try again.');
          setIsUploading(false);
        });
    }
  };

  const addSizeField = () => {
    setSizes([...sizes, { sizeName: '', stockQuantity: '' }]);
  };

  const removeSizeField = (index) => {
    const updatedSizes = sizes.filter((_, i) => i !== index);
    setSizes(updatedSizes);
  };

  const handleSizeChange = (index, field, value) => {
    const updatedSizes = sizes.map((size, i) => {
      if (i === index) {
        return {
          ...size,
          [field]: field === 'stockQuantity' ? parseInt(value) || 0 : value,
        };
      }
      return size;
    });
    setSizes(updatedSizes);
  };

  const getImageUrl = (fileName) => {
    return `${import.meta.env.VITE_FILE_BASE_URL}${fileName}`;
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleColorSelection = (sizeIndex, color) => {
    const updatedSizes = sizes.map((size, i) => {
      if (i === sizeIndex) {
        return { ...size, selectedColor: color }; // Update selected color for this size
      }
      return size;
    });
    setSizes(updatedSizes);
  };

  const deleteProduct = () => {
    http
      .delete(`/product/${id}`)
      .then(() => {
        toast.success('Product deleted successfully!');
        navigate('/');
      })
      .catch(() => {
        toast.error('Failed to delete product. Please try again.');
      });
  };

  if (loading) {
    return <Typography>Loading...</Typography>; // This ensures the form doesn't load prematurely.
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        backgroundColor: '#f4f4f4',
        padding: '40px 20px',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: '1000px',
          padding: '30px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          backgroundColor: '#ffffff',
        }}
      >
        {/*  Back Button */}
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{
            marginBottom: 2,
            marginTop: 4, //  ADD MORE SPACING AT THE TOP
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

        {/* Page Title */}
        <Typography
          variant="h4"
          sx={{
            mb: 4,
            color: '#2c3e50',
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Edit Product
        </Typography>

        <Box component="form" onSubmit={formik.handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                minRows={2}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.description &&
                  Boolean(formik.errors.description)
                }
                helperText={
                  formik.touched.description && formik.errors.description
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Long Description"
                name="longDescription"
                multiline
                minRows={3}
                value={formik.values.longDescription}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.longDescription &&
                  Boolean(formik.errors.longDescription)
                }
                helperText={
                  formik.touched.longDescription &&
                  formik.errors.longDescription
                }
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Price"
                name="price"
                type="number"
                value={formik.values.price}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.price && Boolean(formik.errors.price)}
                helperText={formik.touched.price && formik.errors.price}
                sx={{ mb: 2 }}
              />
              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Price Range:{' '}
                <strong>{priceRangeMap[product.priceRange] || 'N/A'}</strong>
              </Typography>

              <Typography variant="subtitle1" sx={{ mt: 2 }}>
                Sizes and Stock Quantities:
              </Typography>
              {sizes.map((size, index) => (
                <Grid
                  container
                  key={index}
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      placeholder="Size (e.g., S, M, L)"
                      label="Size"
                      value={size.sizeName}
                      onChange={(e) =>
                        handleSizeChange(index, 'sizeName', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={5}>
                    <TextField
                      fullWidth
                      placeholder="Stock Quantity"
                      label="Stock Quantity"
                      type="number"
                      value={size.stockQuantity}
                      onChange={(e) =>
                        handleSizeChange(index, 'stockQuantity', e.target.value)
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2">
                      Select Color for this Size:
                    </Typography>
                    <FormControl fullWidth>
                      <InputLabel>Select Color</InputLabel>
                      <Select
                        value={size.selectedColor || ''}
                        onChange={(e) =>
                          handleColorSelection(index, e.target.value)
                        }
                      >
                        {colors.map((color, colorIndex) => (
                          <MenuItem key={colorIndex} value={color}>
                            {color}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={2} sx={{ textAlign: 'center' }}>
                    {sizes.length > 1 && (
                      <IconButton
                        color="error"
                        onClick={() => removeSizeField(index)}
                      >
                        <RemoveCircleOutline />
                      </IconButton>
                    )}
                    {index === sizes.length - 1 && (
                      <IconButton color="primary" onClick={addSizeField}>
                        <AddCircleOutline />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              ))}

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Colors:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Enter color"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                />
                <Button variant="contained" onClick={addColor}>
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {colors.map((color, index) => (
                  <Chip
                    key={index}
                    label={color} // This label will now only show the color name
                    onDelete={() => removeColor(color)} // Removes the color when clicked
                    color="primary"
                  />
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Categories:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {[
                  'Landing',
                  'New arrivals',
                  'Trending',
                  'Women',
                  'Men',
                  'Girls',
                  'Boys',
                ].map((category) => (
                  <Button
                    key={category}
                    variant={
                      formik.values.categories.includes(category)
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() => {
                      const selected = formik.values.categories.includes(
                        category
                      )
                        ? formik.values.categories.filter((c) => c !== category)
                        : [...formik.values.categories, category];

                      formik.setFieldValue('categories', selected);
                    }}
                    sx={{
                      borderRadius: '20px',
                      border: '1px solid #ccc',
                      backgroundColor: formik.values.categories.includes(
                        category
                      )
                        ? '#555'
                        : '#fff',
                      color: formik.values.categories.includes(category)
                        ? '#fff'
                        : '#000',
                      '&:hover': { backgroundColor: '#f0f0f0', color: '#000' },
                      padding: '8px 16px',
                      textTransform: 'none',
                    }}
                  >
                    {category}
                  </Button>
                ))}
              </Box>

              <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                Fits:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {['Regular Tapered', 'Skinny Tapered', 'Seasonal Fit'].map(
                  (fit) => (
                    <Button
                      key={fit}
                      variant={
                        formik.values.fits.includes(fit)
                          ? 'contained'
                          : 'outlined'
                      }
                      onClick={() => {
                        const selected = formik.values.fits.includes(fit)
                          ? formik.values.fits.filter((f) => f !== fit)
                          : [...formik.values.fits, fit];

                        formik.setFieldValue('fits', selected);
                      }}
                      sx={{
                        borderRadius: '20px',
                        border: '1px solid #ccc',
                        backgroundColor: formik.values.fits.includes(fit)
                          ? '#555'
                          : '#fff',
                        color: formik.values.fits.includes(fit)
                          ? '#fff'
                          : '#000',
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                          color: '#000',
                        },
                        padding: '8px 16px',
                        textTransform: 'none',
                      }}
                    >
                      {fit}
                    </Button>
                  )
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  height: '100%',
                  justifyContent: 'center',
                  gap: 2,
                }}
              >
                <Button
                  variant="contained"
                  component="label"
                  sx={{
                    backgroundColor: '#4caf50',
                    '&:hover': { backgroundColor: '#45a049' },
                  }}
                >
                  Upload Image
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={onFileChange}
                  />
                </Button>
                {imageError && (
                  <Typography variant="body2" color="error">
                    {imageError}
                  </Typography>
                )}
                {isUploading ? (
                  <Typography variant="body2" color="textSecondary">
                    Uploading...
                  </Typography>
                ) : (
                  imageFile && (
                    <Box
                      sx={{
                        width: '200px',
                        height: '200px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        alt="Product Preview"
                        src={getImageUrl(imageFile)}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  )
                )}
              </Box>
            </Grid>
          </Grid>
          <CardActions
            sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}
          >
            <Button
              type="submit" // Make sure it submits the form
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#45a049' },
              }}
            >
              Update
            </Button>

            <Button variant="contained" color="error" onClick={handleOpen}>
              Delete
            </Button>
          </CardActions>
        </Box>
        <ToastContainer />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this product?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" color="inherit" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={deleteProduct}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EditProduct;
