import axios from 'axios';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    let accessToken = localStorage.getItem('accessToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    if (config.data && config.data.user) {
      delete config.data.user;
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (error.response.status === 401 || error.response.status === 403) {
      localStorage.clear();
      window.location = '/login';
    }
    return Promise.reject(error);
  }
);

// Wishlist-related functions

// Function to get the user's wishlist
export const getWishlist = async () => {
  try {
    const response = await instance.get('/wishlist');
    return response.data; // Return the wishlist data
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

// Function to add an item to the wishlist
export const addToWishlist = async (productId) => {
  try {
    const response = await instance.post('/wishlist', { productId });
    return response.data; // Return the added wishlist item
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

// Function to remove an item from the wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const response = await instance.delete(`/wishlist/${productId}`);
    return response.data; // Return the updated wishlist after removal
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export default instance;
