'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import productService from '@/services/productService';
import axios from '@/services/axiosInstance';
import { toast } from 'react-toastify';
import { FaSave, FaArrowLeft, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import Link from 'next/link';

export default function ProductEditPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    const isAddMode = id === 'new';

    // ... (Existing Imports)

    const [isLoading, setIsLoading] = useState(!isAddMode);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        discount: '',
        stock: '',
        category: '',
        brand: '',
        rating: 0,
        reviews: [] as any[],
        images: [''],
        colors: [] as string[],
        variants: [] as any[] // Start with empty variants
    });

    const [categories, setCategories] = useState([]);
    const [colorInput, setColorInput] = useState('');

    // Variant State Helper
    const [newVariant, setNewVariant] = useState({
        sku: '',
        price: '',
        stock: '',
        attributes: { key: '', value: '' }, // Simple key-value builder for demo
        attributeList: {} as Record<string, string>,
        images: ['']
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('categories');
                setCategories(data.data);
            } catch (error) {
                console.error("Failed to fetch categories");
                toast.error("Failed to load categories");
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        if (!isAddMode) {
            const fetchProduct = async () => {
                try {
                    const response = await productService.getProductById(id as string);
                    const product = response.data;

                    let initialImages = product.images && product.images.length > 0
                        ? product.images
                        : (product.image ? [product.image] : ['']);

                    setFormData({
                        title: product.title,
                        description: product.description,
                        price: product.price,
                        discount: product.discount || '',
                        stock: product.stock,
                        category: product.category,
                        brand: product.brand || '',
                        rating: product.rating,
                        reviews: product.reviews || [],
                        images: initialImages,
                        colors: product.colors || [],
                        variants: product.variants || []
                    });
                } catch (error) {
                    toast.error("Failed to fetch product details");
                    router.push('/admin/products');
                } finally {
                    setIsLoading(false);
                }
            };
            fetchProduct();
        }
    }, [id, isAddMode, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const addImageField = () => {
        setFormData(prev => ({ ...prev, images: [...prev.images, ''] }));
    };

    const handleImageChange = (index: number, value: string) => {
        const newImages = [...formData.images];
        newImages[index] = value;
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    const removeImageField = (index: number) => {
        const newImages = formData.images.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, images: newImages }));
    };

    // Variant Handlers
    const handleVariantAttributeAdd = () => {
        if (newVariant.attributes.key && newVariant.attributes.value) {
            setNewVariant(prev => ({
                ...prev,
                attributeList: { ...prev.attributeList, [prev.attributes.key]: prev.attributes.value },
                attributes: { key: '', value: '' }
            }));
        }
    };

    const handleAddVariant = () => {
        // Basic validation
        if (Object.keys(newVariant.attributeList).length === 0) {
            return toast.error("Please add at least one attribute (e.g. Size: M)");
        }

        const variantToAdd = {
            sku: newVariant.sku,
            price: Number(newVariant.price) || Number(formData.price),
            stock: Number(newVariant.stock) || Number(formData.stock),
            attributes: newVariant.attributeList,
            images: newVariant.images.filter(i => i)
        };

        setFormData(prev => ({ ...prev, variants: [...prev.variants, variantToAdd] }));

        // Reset
        setNewVariant({
            sku: '',
            price: '',
            stock: '',
            attributes: { key: '', value: '' },
            attributeList: {},
            images: ['']
        });
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const validImages = formData.images.filter(img => img.trim() !== '');
            if (validImages.length === 0) {
                toast.error("Please add at least one image");
                return;
            }

            const payload = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
                rating: Number(formData.rating),
                images: validImages,
                image: validImages[0],
                // backend expects variants array
                variants: formData.variants
            };

            if (isAddMode) {
                await productService.createProduct(payload);
                toast.success("Product created successfully");
            } else {
                await productService.updateProduct(id as string, payload);
                toast.success("Product updated successfully");
            }
            router.push('/admin/products');
        } catch (error: any) {
            const msg = error.response?.data?.error || "Failed to save product";
            toast.error(msg);
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-blue-600" /></div>;

    return (
        <div className="max-w-4xl mx-auto">
            {/* ... (Header) */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/products" className="text-[#8D8D8D] hover:text-[#C08C6C] transition-colors">
                    <FaArrowLeft /> Back
                </Link>
                <h1 className="text-2xl font-bold text-gray-800">{isAddMode ? 'Add New Product' : 'Edit Product'}</h1>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* ... (Existing Fields: Title, Category, Description, Prices, Colors, Images) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="font-medium text-gray-700">Product Title</label>
                            <input required name="title" value={formData.title} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-gray-900" placeholder="e.g. Wireless Headphone" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-gray-700">Category</label>
                            <select
                                required
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-gray-900"
                            >
                                <option value="">Select Category</option>
                                {categories.map((cat: any) => (
                                    <option key={cat._id} value={cat.name}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="font-medium text-gray-700">Description</label>
                        <textarea required name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none h-32 text-gray-900" placeholder="Detailed product description..."></textarea>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="font-medium text-gray-700">Base Price (₹)</label>
                            <input required type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-gray-900" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-gray-700">Discount Label</label>
                            <input name="discount" value={formData.discount} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-gray-900" placeholder="e.g. 50% off" />
                        </div>
                        <div className="space-y-2">
                            <label className="font-medium text-gray-700">Total Stock</label>
                            <input required type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none text-gray-900" />
                        </div>
                    </div>

                    {/* Simplified Image Manager (Keeping existing logic) */}
                    <div className="space-y-3">
                        <label className="font-medium text-gray-700 flex justify-between items-center">
                            Product Images
                            <button type="button" onClick={addImageField} className="text-sm text-[#C08C6C] hover:text-[#A06C4C] flex items-center gap-1 font-semibold">
                                <FaPlus /> Add URL
                            </button>
                        </label>
                        {formData.images.map((img, index) => (
                            <div key={index} className="flex gap-4 items-start">
                                <div className="flex-1">
                                    <input value={img} onChange={(e) => handleImageChange(index, e.target.value)} className="w-full border p-2 rounded outline-none text-gray-900" placeholder="Image URL" />
                                </div>
                                <button type="button" onClick={() => removeImageField(index)} className="p-2 text-red-500"><FaTrash /></button>
                            </div>
                        ))}
                    </div>

                    {/* --- VARIANTS SECTION --- */}
                    <div className="border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Product Variants</h3>
                        <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                            <h4 className="font-medium text-sm text-gray-700 mb-3">Add New Variant</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                                <input
                                    placeholder="Variant Specific Price (Optional)"
                                    type="number"
                                    value={newVariant.price}
                                    onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                                    className="border p-2 rounded text-sm text-gray-900"
                                />
                                <input
                                    placeholder="Variant Stock"
                                    type="number"
                                    value={newVariant.stock}
                                    onChange={(e) => setNewVariant({ ...newVariant, stock: e.target.value })}
                                    className="border p-2 rounded text-sm text-gray-900"
                                />
                                <input
                                    placeholder="SKU (Optional)"
                                    value={newVariant.sku}
                                    onChange={(e) => setNewVariant({ ...newVariant, sku: e.target.value })}
                                    className="border p-2 rounded text-sm text-gray-900"
                                />
                            </div>

                            <div className="mb-3">
                                <label className="text-xs font-semibold uppercase text-gray-500 mb-1 block">Attributes</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        placeholder="Key (e.g. Size)"
                                        value={newVariant.attributes.key}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, attributes: { ...prev.attributes, key: e.target.value } }))}
                                        className="border p-2 rounded text-sm flex-1 text-gray-900"
                                    />
                                    <input
                                        placeholder="Value (e.g. Medium)"
                                        value={newVariant.attributes.value}
                                        onChange={(e) => setNewVariant(prev => ({ ...prev, attributes: { ...prev.attributes, value: e.target.value } }))}
                                        className="border p-2 rounded text-sm flex-1 text-gray-900"
                                    />
                                    <button type="button" onClick={handleVariantAttributeAdd} className="bg-gray-200 px-3 rounded text-sm font-bold">+</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(newVariant.attributeList).map(([k, v]) => (
                                        <span key={k} className="bg-[#F5F5F0] text-[#C08C6C] text-xs px-2 py-1 rounded border border-[#E5E0D8]">
                                            {k}: {v}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <button type="button" onClick={handleAddVariant} className="w-full bg-stone-800 text-white py-2 rounded text-sm font-bold hover:bg-black transition-colors">
                                Add Variant
                            </button>
                        </div>

                        {/* Validated Variants List */}
                        {formData.variants.length > 0 && (
                            <div className="space-y-2">
                                {formData.variants.map((variant, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
                                        <div>
                                            <div className="flex gap-2 text-sm font-medium">
                                                {Object.entries(variant.attributes || {}).map(([k, v]: any) => (
                                                    <span key={k} className="text-gray-700">{k}: {v}</span>
                                                ))}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                ₹{variant.price} | Stock: {variant.stock}
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => removeVariant(idx)} className="text-red-500 hover:text-red-700">
                                            <FaTrash />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="pt-4 border-t border-[#E5E0D8] flex justify-end">
                        <button type="submit" className="bg-[#C08C6C] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#C08C6C]/20 hover:bg-[#A06C4C] hover:-translate-y-1 transition-all flex items-center gap-2 uppercase text-sm tracking-wide">
                            <FaSave /> {isAddMode ? 'Create Product' : 'Update Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
