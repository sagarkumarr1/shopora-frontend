'use client';

import { useEffect, useState } from 'react';
import orderService from '@/services/orderService';
import { toast } from 'react-toastify';
import { FaEye, FaSpinner, FaCheckCircle, FaTimesCircle, FaTruck } from 'react-icons/fa';
import Link from 'next/link';

export default function AdminOrders() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getAllOrders();
            // Backend returns { success: true, count: N, data: [...] } or just [...] depend on controller
            // Let's verify controller response structure. 
            // In orderController getOrders: res.status(200).json({ success: true, count: orders.length, data: orders });
            // So we need data.data
            // But wait, `orderService.getAllOrders` returns `response.data`.
            // So `data` here IS `response.data`.
            // So `orders` is `data.data`.
            setOrders(data.data || []);
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch orders");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await orderService.updateOrderStatus(id, status);
            toast.success(`Order marked as ${status}`);
            fetchOrders(); // Refresh
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered': return 'text-green-600 bg-green-50';
            case 'Processing': return 'text-blue-600 bg-blue-50';
            case 'Cancelled': return 'text-red-600 bg-red-50';
            default: return 'text-yellow-600 bg-yellow-50';
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><FaSpinner className="animate-spin text-4xl text-[#C08C6C]" /></div>;

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Orders Management</h1>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#F5F5F0] border-b border-[#E5E0D8]">
                                <th className="p-4 font-semibold text-gray-600">Order ID</th>
                                <th className="p-4 font-semibold text-gray-600">Customer</th>
                                <th className="p-4 font-semibold text-gray-600">Date</th>
                                <th className="p-4 font-semibold text-gray-600">Total</th>
                                <th className="p-4 font-semibold text-gray-600">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b last:border-0 hover:bg-[#FAFAFA] transition-colors border-[#E5E0D8]">
                                    <td className="p-4 font-mono text-sm">{order._id.substring(0, 10)}...</td>
                                    <td className="p-4">
                                        <div className="font-medium">{order.user?.name || 'Guest'}</div>
                                        <div className="text-xs text-gray-500">{order.user?.email}</div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {new Date(order.createdAt).toLocaleDateString()}, <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="p-4 font-bold">₹{order.totalPrice.toLocaleString()}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(order.orderStatus)}`}>
                                            {order.orderStatus}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            {/* Status Actions */}
                                            <Link
                                                href={`/admin/orders/${order._id}`}
                                                className="p-2 text-[#C08C6C] hover:bg-[#F5F5F0] rounded transition-colors"
                                                title="View Details"
                                            >
                                                <FaEye />
                                            </Link>
                                            {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                                                        title="Mark Delivered"
                                                        className="p-2 text-green-600 hover:bg-green-50 rounded"
                                                    >
                                                        <FaCheckCircle />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(order._id, 'Cancelled')}
                                                        title="Cancel Order"
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                                                    >
                                                        <FaTimesCircle />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-gray-500">No orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
