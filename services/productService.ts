import axios from './axiosInstance';

// Get all products with filters
const getProducts = async (params: any = {}) => {
    const queryParams = new URLSearchParams();

    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.category) queryParams.append('category', params.category);
    if (params.minPrice) queryParams.append('minPrice', params.minPrice);
    if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice);
    if (params.rating) queryParams.append('rating', params.rating);
    if (params.sort) queryParams.append('sort', params.sort);

    const response = await axios.get(`products/?${queryParams.toString()}`);
    return response.data;
};

// Get product by ID
const getProductById = async (id: string) => {
    const response = await axios.get('products/' + id); // Public route
    return response.data;
};

// Create product (Admin)
const createProduct = async (productData: any) => {
    const response = await axios.post('products/', productData);
    return response.data;
};

// Update product (Admin)
const updateProduct = async (id: string, productData: any) => {
    const response = await axios.put('products/' + id, productData);
    return response.data;
};

// Delete product (Admin)
const deleteProduct = async (id: string) => {
    const response = await axios.delete('products/' + id);
    return response.data;
};

// Get suggestions
const getSuggestions = async (query: string) => {
    const response = await axios.get(`products/suggestions?q=${query}`);
    return response.data;
};

// Get category deals
const getCategoryDeals = async () => {
    const response = await axios.get('products/deals');
    return response.data;
};

// Create product review
const createReview = async (id: string, reviewData: any) => {
    const response = await axios.post(`products/${id}/reviews`, reviewData);
    return response.data;
};

// Get all categories
const getCategories = async () => {
    const response = await axios.get('categories');
    return response.data;
};

// Get all reviews (Admin)
const getAllReviews = async () => {
    const response = await axios.get('products/admin/reviews');
    return response.data;
};

// Delete review
const deleteReview = async (productId: string, reviewId: string) => {
    const response = await axios.delete(`products/${productId}/reviews/${reviewId}`);
    return response.data;
};

// Update review
const updateReview = async (productId: string, reviewId: string, reviewData: any) => {
    const response = await axios.put(`products/${productId}/reviews/${reviewId}`, reviewData);
    return response.data;
};

const productService = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getSuggestions,
    getCategoryDeals,
    createReview,
    getCategories,
    getAllReviews,
    deleteReview,
    updateReview
};

export default productService;
