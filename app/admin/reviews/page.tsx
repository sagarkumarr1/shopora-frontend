'use client';

import { useEffect, useState } from 'react';
import { FaTrash, FaSpinner, FaStar } from 'react-icons/fa';
import { toast } from 'react-toastify';
import productService from '@/services/productService';
import Link from 'next/link';

interface Review {
    _id: string;
    product: string;
    productId: string;
    user: string;
    userId: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export default function AdminReviews() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            const data = await productService.getAllReviews();
            if (data.success) {
                setReviews(data.data);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.error || 'Failed to fetch reviews');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (productId: string, reviewId: string) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await productService.deleteReview(productId, reviewId);
                toast.success('Review deleted successfully');
                // Optimistic update or refetch
                setReviews(reviews.filter((r) => r._id !== reviewId));
            } catch (error: any) {
                toast.error(error.response?.data?.error || 'Failed to delete review');
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Reviews & Ratings</h1>
                <div className="text-sm text-gray-600 bg-white px-3 py-1 rounded shadow-sm">
                    Total Reviews: <span className="font-bold text-[#C08C6C]">{reviews.length}</span>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-[#C08C6C]" /></div>
                ) : reviews.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">No reviews found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[#F5F5F0] border-b border-[#E5E0D8]">
                                    <th className="p-4 font-semibold text-gray-600">Product</th>
                                    <th className="p-4 font-semibold text-gray-600">User</th>
                                    <th className="p-4 font-semibold text-gray-600">Rating</th>
                                    <th className="p-4 font-semibold text-gray-600 w-1/3">Comment</th>
                                    <th className="p-4 font-semibold text-gray-600">Date</th>
                                    <th className="p-4 font-semibold text-gray-600 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reviews.map((review) => (
                                    <tr key={review._id} className="border-b last:border-0 hover:bg-[#FAFAFA] transition-colors border-[#E5E0D8]">
                                        <td className="p-4">
                                            <Link href={`/product/${review.product.toLowerCase().replace(/ /g, '-')}`} target="_blank" className="font-medium text-[#C08C6C] hover:underline line-clamp-1 max-w-[200px]">
                                                {review.product}
                                            </Link>
                                            <span className="text-xs text-gray-400">ID: {review.productId.substring(0, 6)}...</span>
                                        </td>
                                        <td className="p-4 text-gray-600">{review.user}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-1 text-[#C08C6C]">
                                                <span className="font-bold text-gray-800">{review.rating}</span> <FaStar className="text-xs" />
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-600 text-sm leading-relaxed max-w-xs">{review.comment}</td>
                                        <td className="p-4 text-gray-500 text-xs">{new Date(review.createdAt).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <button
                                                onClick={() => handleDelete(review.productId, review._id)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Review"
                                            >
                                                <FaTrash />
                                            </button>
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
