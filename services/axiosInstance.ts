import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://shopora-backend-nine.vercel.app/api').replace(/\/$/, '');

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Keep this for cookies just in case, but Header will take precedence
});

// Request interceptor to add Bearer Token
axiosInstance.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user.token) {
                    config.headers.Authorization = `Bearer ${user.token}`;
                }
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            const { toast } = require('react-toastify');

            if (!error.response) {
                // Network error (no response)
                toast.error("Network Error: Please check your internet connection.");
            } else if (error.response.status === 401) {
                // Session expired / Unauthorized
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('user');
                    // Use window.location for hard redirect to clear all states reliably
                    toast.error("Session expired. Please login again.");
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1500);
                }
            } else if (error.response.status >= 500) {
                // Server error
                toast.error("Server Error: Something went wrong on our end. Please try again later.");
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
