'use client';

import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from '@/services/axiosInstance';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import { FaTrash } from 'react-icons/fa';

export default function ManageCategories() {
    const { user } = useSelector((state: any) => state.auth);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [newCategoryImage, setNewCategoryImage] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('categories');
            setCategories(data.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load categories');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleAddCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategory.trim()) return;

        try {
            await axios.post('categories', {
                name: newCategory,
                image: newCategoryImage || undefined
            });
            toast.success('Category added successfully');
            setNewCategory('');
            setNewCategoryImage('');
            fetchCategories();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add category');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this category?')) return;
        try {
            await axios.delete(`categories/${id}`);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    if (!user || user.role !== 'admin') {
        return <div className="p-10 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <Navbar />
            <div className="pt-24 max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Categories</h1>

                {/* Add Category Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Category</h2>
                    <form onSubmit={handleAddCategory} className="flex flex-col md:flex-row gap-4">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="Enter category name"
                            className="flex-1 border p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <input
                            type="text"
                            value={newCategoryImage}
                            onChange={(e) => setNewCategoryImage(e.target.value)}
                            placeholder="Image URL (optional)"
                            className="flex-1 border p-3 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            type="submit"
                            className="bg-orange-600 text-white px-6 py-3 rounded font-bold hover:bg-orange-700 transition"
                        >
                            Add
                        </button>
                    </form>
                </div>

                {/* Categories List */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Existing Categories</h2>
                    {loading ? (
                        <p>Loading...</p>
                    ) : categories.length === 0 ? (
                        <p className="text-gray-500">No categories found.</p>
                    ) : (
                        <div className="space-y-2">
                            {categories.map((cat: any) => (
                                <div key={cat._id} className="flex justify-between items-center p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0 border">
                                            <img
                                                src={cat.image && cat.image !== 'no-photo.jpg' ? cat.image : "https://via.placeholder.com/50?text=Cat"}
                                                alt={cat.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <span className="text-gray-800 font-medium text-lg">{cat.name}</span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cat._id)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        title="Delete Category"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
