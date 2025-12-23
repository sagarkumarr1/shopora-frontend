import axios from './axiosInstance';

// Helper to set cookie
const setCookie = (name: string, value: string, days: number) => {
    if (typeof document !== 'undefined') {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = "expires=" + date.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/;SameSite=Strict";
    }
};

// Helper to remove cookie
const removeCookie = (name: string) => {
    if (typeof document !== 'undefined') {
        document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }
};

// Register user
const register = async (userData: any) => {
    const response = await axios.post('auth/register', userData);

    if (response.data) {
        // Save user AND token
        const userPayload = { ...response.data.user, token: response.data.token };
        localStorage.setItem('user', JSON.stringify(userPayload));
        // Set cookie for middleware
        setCookie('token', response.data.token, 7);
    }

    return response.data;
};

// Login user
const login = async (userData: any) => {
    const response = await axios.post('auth/login', userData);

    if (response.data) {
        // Save user AND token
        const userPayload = { ...response.data.user, token: response.data.token };
        localStorage.setItem('user', JSON.stringify(userPayload));
        // Set cookie for middleware
        setCookie('token', response.data.token, 7);
    }

    return response.data;
};

// Logout user
const logout = async () => {
    await axios.get('auth/logout');
    localStorage.removeItem('user');
    removeCookie('token');
};

// Get all users (Admin)
const getAllUsers = async () => {
    const response = await axios.get('auth/users');
    return response.data;
};

// Get current user
const getMe = async () => {
    const response = await axios.get('auth/me');
    return response.data;
};

// Update Details
const updateDetails = async (userData: any) => {
    const response = await axios.put('auth/updatedetails', userData);
    return response.data;
};

// Toggle Wishlist
const toggleWishlist = async (productId: string) => {
    const response = await axios.put(`auth/wishlist/${productId}`);
    return response.data;
};

const authService = {
    register,
    login,
    logout,
    getMe,
    updateDetails,
    toggleWishlist,
    getAllUsers
};

export default authService;
