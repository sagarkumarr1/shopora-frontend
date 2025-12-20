import axios from './axiosInstance';

// Get all categories
const getCategories = async () => {
    const response = await axios.get('categories/');
    return response.data;
};

// Create category (Admin)
const createCategory = async (categoryData: any) => {
    const response = await axios.post('categories/', categoryData);
    return response.data;
};

// Delete category (Admin)
const deleteCategory = async (id: string) => {
    const response = await axios.delete('categories/' + id);
    return response.data;
};

const categoryService = {
    getCategories,
    createCategory,
    deleteCategory
};

export default categoryService;
