'use client';

import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';
import { toast } from 'react-toastify';
import Navbar from '@/components/Navbar';
import { FaTrash, FaPlus, FaExternalLinkAlt } from 'react-icons/fa';

export default function ManageHero() {
    const [heroes, setHeroes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        title: '',
        title: '',
        subtitle: '',
        image: '',
        mobileImage: '',
        link: '/'
    });

    const fetchHeroes = async () => {
        try {
            const { data } = await axios.get('hero');
            setHeroes(data.data);
            setLoading(false);
        } catch (error) {
            toast.error('Failed to load banners');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeroes();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await axios.post('hero', formData);
            toast.success('Banner added successfully');
            setFormData({ title: '', subtitle: '', image: '', mobileImage: '', link: '/' });
            fetchHeroes();
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to add banner');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;
        try {
            await axios.delete(`hero/${id}`);
            toast.success('Banner deleted');
            fetchHeroes();
        } catch (error) {
            toast.error('Failed to delete banner');
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-10">
            <Navbar />
            <div className="pt-24 max-w-5xl mx-auto px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Homepage Banners</h1>

                {/* Add Hero Form */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-xl font-semibold mb-4 text-gray-700">Add New Banner</h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Desktop Image URL</label>
                            <input
                                required
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Mobile Image URL (Optional)</label>
                            <input
                                name="mobileImage"
                                value={formData.mobileImage}
                                onChange={handleChange}
                                placeholder="https://..."
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Link URL</label>
                            <input
                                name="link"
                                value={formData.link}
                                onChange={handleChange}
                                placeholder="/products/..."
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Title (Optional)</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Big Sale!"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-1">Subtitle (Optional)</label>
                            <input
                                name="subtitle"
                                value={formData.subtitle}
                                onChange={handleChange}
                                placeholder="Up to 50% off"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 transition flex items-center gap-2"
                            >
                                <FaPlus /> Add Banner
                            </button>
                        </div>
                    </form>
                </div>

                {/* Preview List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Active Banners</h2>
                    {heroes.map((hero: any) => (
                        <div key={hero._id} className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center">
                            <div className="w-full md:w-48 h-32 relative bg-gray-100 rounded overflow-hidden">
                                <img src={hero.image} alt={hero.title} className="w-full h-full object-cover" />
                                {hero.mobileImage && <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-[10px] px-1">Mobile</div>}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-bold text-lg">{hero.title || 'No Title'}</h3>
                                <p className="text-gray-500">{hero.subtitle}</p>
                                <a href={hero.link} target="_blank" rel="noreferrer" className="text-blue-500 text-sm flex items-center gap-1 mt-1 hover:underline">
                                    <FaExternalLinkAlt size={12} /> {hero.link}
                                </a>
                            </div>
                            <button
                                onClick={() => handleDelete(hero._id)}
                                className="text-red-500 hover:bg-red-50 p-2 rounded"
                                title="Delete"
                            >
                                <FaTrash size={20} />
                            </button>
                        </div>
                    ))}
                    {!loading && heroes.length === 0 && <p className="text-gray-500">No banners found.</p>}
                </div>
            </div>
        </div>
    );
}
