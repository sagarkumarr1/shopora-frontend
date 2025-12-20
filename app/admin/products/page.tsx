'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProducts, deleteProduct, reset } from '@/store/productSlice';
import { RootState, AppDispatch } from '@/store/store';
import { FaEdit, FaPlus, FaTrash, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function AdminProducts() {
    const dispatch = useDispatch<AppDispatch>();
    const { products, isLoading, isError, message } = useSelector((state: RootState) => state.product);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getProducts(''));

        return () => {
            dispatch(reset());
        };
    }, [dispatch]);

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }
    }, [isError, message]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await dispatch(deleteProduct(id));
            toast.success('Product deleted successfully');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Products</h1>
                <Link href="/admin/products/new" className="bg-[#C08C6C] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#A06C4C] hover:shadow-md transition-all font-medium text-sm">
                    <FaPlus /> Add Product
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-[#C08C6C]" /></div>
                ) : products.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No products found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F0] border-b border-[#E5E0D8]">
                                    <th className="p-4 font-semibold text-gray-600">Product</th>
                                    <th className="p-4 font-semibold text-gray-600">Category</th>
                                    <th className="p-4 font-semibold text-gray-600">Price</th>
                                    <th className="p-4 font-semibold text-gray-600">Stock</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} className="border-b last:border-0 hover:bg-[#FAFAFA] transition-colors border-[#E5E0D8]">
                                        <td className="p-4 flex items-center gap-3">
                                            <div className="w-10 h-10 flex-shrink-0">
                                                <img src={product.image || (product.images && product.images[0]) || '/placeholder.png'} alt={product.title} className="w-full h-full object-contain" />
                                            </div>
                                            <span className="font-medium text-gray-800 line-clamp-1 max-w-[200px]">{product.title}</span>
                                        </td>
                                        <td className="p-4 text-gray-600">{product.category}</td>
                                        <td className="p-4 font-medium text-gray-800">₹{product.price.toLocaleString()}</td>
                                        <td className="p-4 text-gray-600">{product.stock}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Link href={`/admin/products/${product._id}`} className="p-2 text-[#C08C6C] hover:bg-[#F5F5F0] rounded transition-colors">
                                                    <FaEdit />
                                                </Link>
                                                <button onClick={() => handleDelete(product._id)} className="p-2 text-red-600 hover:bg-red-50 rounded">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
