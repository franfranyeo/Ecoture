import axios from "axios";

// Create an Axios instance with a base URL from environment variables
const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL // Ensure this is correctly set in your .env file
});

// Add a request interceptor to include the access token in headers
instance.interceptors.request.use(
    (config) => {
        // Retrieve the access token from local storage
        const accessToken = localStorage.getItem('accessToken');
        if (accessToken) {
            config.headers["Authorization"] = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        // Handle any request errors
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle errors and manage token expiration
instance.interceptors.response.use(
    (response) => {
        // Return response data as-is
        return response;
    },
    (error) => {
        if (error.response) {
            const { status } = error.response;
            // Handle specific HTTP status codes
            if (status === 401 || status === 403) {
                // Clear local storage and redirect to login if unauthorized or forbidden
                localStorage.clear();
                window.location = '/login';
            }
        }
        // Pass the error to the caller
        return Promise.reject(error);
    }
);

// // Fetch users example
// export const fetchUsers = async () => {
//     try {
//         const response = await instance.get('/user/users');
//         return response.data;
//     } catch (error) {
//         // Handle any errors that occurred during the request
//         throw error;
//     }
// };

// // Subscription example
// export const subscribe = async (name, email) => {
//     try {
//         const response = await instance.post('/subscribe', { name, email });
//         return response.data;
//     } catch (error) {
//         // Handle any errors that occurred during the request
//         throw error;
//     }
// };

export default instance;
