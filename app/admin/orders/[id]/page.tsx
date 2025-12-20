'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import orderService from '@/services/orderService';
import { toast } from 'react-toastify';
import { FaArrowLeft, FaBox, FaTruck, FaUser, FaMapMarkerAlt, FaCreditCard, FaPrint, FaSave } from 'react-icons/fa';
import Link from 'next/link';
import Image from 'next/image';

export default function AdminOrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Tracking Form State
    const [trackingId, setTrackingId] = useState('');
    const [courierName, setCourierName] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');
    const [status, setStatus] = useState('');

    const fetchOrder = async () => {
        try {
            const data = await orderService.getOrderById(id as string);
            const ord = data.data;
            setOrder(ord);
            setStatus(ord.orderStatus);
            if (ord.trackingResult) {
                setTrackingId(ord.trackingResult.id || '');
                setCourierName(ord.trackingResult.courier || '');
                setTrackingUrl(ord.trackingResult.url || '');
            }
            if (ord.estimatedDeliveryDate) {
                // Format for input type="date"
                setEstimatedDeliveryDate(new Date(ord.estimatedDeliveryDate).toISOString().split('T')[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch order details");
            router.push('/admin/orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const handleUpdate = async () => {
        try {
            const trackingData = {
                id: trackingId,
                courier: courierName,
                url: trackingUrl
            };

            const updatePayload: any = {
                tracking: trackingData
            };
            if (estimatedDeliveryDate) updatePayload.estimatedDeliveryDate = estimatedDeliveryDate;

            // If tracking info provided and status is Pending/Processing, auto-switch to Shipped? 
            // Better let user decide, but we can default.

            await orderService.updateOrderStatus(id as string, status, trackingData, estimatedDeliveryDate);
            toast.success("Order updated successfully!");
            fetchOrder();
        } catch (error) {
            toast.error("Failed to update order");
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!order) return <div className="p-10 text-center">Order not found</div>;

    return (
        <div className="max-w-5xl mx-auto pb-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="text-gray-500 hover:text-blue-600 flex items-center gap-1">
                        <FaArrowLeft /> Back
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">Order #{order._id.substring(0, 10)}</h1>
                    <span className={`px-3 py-1 rounded-full text-sm font-bold border ${order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-700 border-green-200' :
                        order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {order.orderStatus}
                    </span>
                </div>
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 border px-3 py-1.5 rounded bg-white shadow-sm"
                >
                    <FaPrint /> Print Invoice
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Left Column: Order Items & Totals */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-700">
                            <FaBox /> Order Items
                        </div>
                        <div className="p-6 space-y-4">
                            {order.orderItems.map((item: any, idx: number) => (
                                <div key={idx} className="flex gap-4 items-center">
                                    <div className="w-16 h-16 relative border rounded bg-gray-50 flex-shrink-0">
                                        <Image src={item.image} alt={item.title} fill className="object-contain p-1" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-800 line-clamp-1">{item.title}</h4>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity} x ₹{item.price.toLocaleString()}</p>
                                    </div>
                                    <div className="font-bold text-gray-800">
                                        ₹{(item.quantity * item.price).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {/* Summary */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Items Total</span>
                                <span>₹{order.itemsPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax</span>
                                <span>₹{order.taxPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                                <span>Total</span>
                                <span className="text-blue-600">₹{order.totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping & Tracking Action Panel */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-700">
                            <FaTruck /> Shipping & Tracking Actions
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
                                    <select
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-100 outline-none"
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={handleUpdate}
                                        className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <FaSave /> Update Order
                                    </button>
                                </div>
                            </div>

                            <hr className="my-4 border-gray-100" />
                            <h3 className="text-sm font-bold text-gray-700 mb-3">Tracking Information</h3>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Courier Name</label>
                                    <input
                                        value={courierName}
                                        onChange={e => setCourierName(e.target.value)}
                                        placeholder="e.g. BlueDart, Delhivery"
                                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tracking ID</label>
                                    <input
                                        value={trackingId}
                                        onChange={e => setTrackingId(e.target.value)}
                                        placeholder="Order Tracking Number"
                                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Tracking URL</label>
                                    <input
                                        value={trackingUrl}
                                        onChange={e => setTrackingUrl(e.target.value)}
                                        placeholder="https://track..."
                                        className="w-full border p-2 rounded text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Customer Info */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-700">
                            <FaUser /> Customer Details
                        </div>
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                                    {order.user?.name ? order.user.name.charAt(0) : 'G'}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{order.user?.name || 'Guest User'}</h3>
                                    <p className="text-sm text-gray-500">{order.user?.email}</p>
                                </div>
                            </div>
                            <div className="text-sm text-gray-600 space-y-1">
                                <p><strong>User ID:</strong> <span className="font-mono text-xs bg-gray-100 px-1 rounded">{order.user?._id || 'N/A'}</span></p>
                                <p><strong>Joined:</strong> {order.user?.createdAt ? new Date(order.user.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-700">
                            <FaMapMarkerAlt /> Shipping Address
                        </div>
                        <div className="p-6 text-sm text-gray-600 leading-relaxed">
                            <p className="font-bold text-gray-800 mb-1">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.locality}, {order.shippingAddress.city}</p>
                            <p>{order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                            <p className="mt-2 font-medium text-gray-800">Phone: {order.shippingAddress.mobile}</p>
                        </div>
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center gap-2 font-semibold text-gray-700">
                            <FaCreditCard /> Payment Info
                        </div>
                        <div className="p-6 text-sm">
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Method</span>
                                <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-gray-800">{order.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                                <span className="text-gray-600">Status</span>
                                <span className={`font-bold px-2 py-0.5 rounded ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    {order.isPaid ? 'PAID' : 'NOT PAID'}
                                </span>
                            </div>
                            {order.isPaid && (
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Paid At</span>
                                    <span>{new Date(order.paidAt).toLocaleDateString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
