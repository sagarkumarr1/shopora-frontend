'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import orderService from '@/services/orderService';
import { FaArrowLeft, FaBox, FaCheck, FaTruck, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Image from 'next/image';

export default function OrderDetails() {
    const params = useParams();
    const router = useRouter();
    const { id } = params;

    const [order, setOrder] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        orderService.getOrderById(id as string)
            .then(res => setOrder(res.data))
            .catch(err => {
                console.error(err);
                router.push('/account'); // Redirect back if error
            })
            .finally(() => setIsLoading(false));
    }, [id, router]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    if (!order) return <div className="min-h-screen flex items-center justify-center">Order not found</div>;

    // Status Logic
    const steps = ['Processing', 'Shipped', 'Delivered'];
    const currentStep = steps.indexOf(order.orderStatus) !== -1 ? steps.indexOf(order.orderStatus) + 1 : 0; // 0 if Pending or Cancelled

    // Status color mapping
    const getStatusColor = (stepIdx: number) => {
        if (order.orderStatus === 'Cancelled') return 'bg-red-500';
        if (order.orderStatus === 'Pending' && stepIdx === 0) return 'bg-gray-300';
        return stepIdx < currentStep ? 'bg-green-500' : 'bg-gray-300';
    };

    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-20 font-sans">
            <Navbar />
            <div className="pt-24 md:pt-32 max-w-6xl mx-auto px-4 lg:px-6">

                {/* Back Link */}
                <Link href="/account" className="inline-flex items-center gap-2 text-[#8D8D8D] hover:text-[#C08C6C] mb-8 font-medium transition-colors group">
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Back to My Orders
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left & Middle: Order Info & Status */}
                    <div className="lg:col-span-2 space-y-6">

                        {/* Header Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8]">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <h1 className="font-serif text-2xl md:text-3xl text-[#2D2D2D] mb-2 font-medium">Order Details</h1>
                                    <p className="text-[#8D8D8D] text-sm">
                                        ID: <span className="text-[#2D2D2D] font-mono font-medium">{order._id}</span>
                                    </p>
                                    <p className="text-[#8D8D8D] text-sm mt-1 italic">
                                        Placed on {new Date(order.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest ${order.orderStatus === 'Delivered' ? 'bg-green-50 text-green-600 border border-green-100' :
                                            order.orderStatus === 'Cancelled' ? 'bg-red-50 text-red-600 border border-red-100' :
                                                'bg-[#C08C6C]/10 text-[#C08C6C] border border-[#C08C6C]/20'
                                        }`}>
                                        {order.orderStatus}
                                    </span>
                                </div>
                            </div>

                            {/* Luxury Stepper */}
                            <div className="relative py-4 mt-8">
                                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#F5F5F0] -translate-y-1/2"></div>
                                <div
                                    className="absolute top-1/2 left-0 h-0.5 bg-[#C08C6C] -translate-y-1/2 transition-all duration-1000 ease-out"
                                    style={{ width: `${(Math.max(0, currentStep) / steps.length) * 100}%` }}
                                ></div>

                                <div className="relative flex justify-between">
                                    {['Ordered', 'Processing', 'Shipped', 'Delivered'].map((label, idx) => {
                                        let active = false;
                                        if (order.orderStatus !== 'Cancelled') {
                                            if (idx === 0) active = true;
                                            else if (order.orderStatus === 'Processing') active = idx <= 1;
                                            else if (order.orderStatus === 'Shipped') active = idx <= 2;
                                            else if (order.orderStatus === 'Delivered') active = idx <= 3;
                                        }

                                        return (
                                            <div key={label} className="flex flex-col items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 z-10 ${active ? 'bg-[#C08C6C] text-white shadow-lg shadow-[#C08C6C]/30 scale-110' : 'bg-[#F5F5F0] text-[#8D8D8D]'
                                                    }`}>
                                                    {active ? <FaCheck size={14} /> : <span className="text-xs font-bold">{idx + 1}</span>}
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-[#C08C6C]' : 'text-[#8D8D8D]'}`}>
                                                    {label}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Items Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8]">
                            <h3 className="font-serif text-xl text-[#2D2D2D] mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#C08C6C]">
                                    <FaBox size={14} />
                                </div>
                                Order Items
                            </h3>
                            <div className="space-y-6">
                                {order.orderItems.map((item: any, idx: number) => (
                                    <div key={idx} className="flex gap-6 items-center group">
                                        <div className="relative w-24 h-24 bg-[#F5F5F0] rounded-2xl overflow-hidden border border-[#E5E0D8] group-hover:border-[#C08C6C]/30 transition-colors">
                                            <Image src={item.image} alt={item.title} fill className="object-contain p-2 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-[#2D2D2D] md:text-lg">{item.title}</h4>
                                            {item.variantAttributes && Object.keys(item.variantAttributes).length > 0 && (
                                                <p className="text-xs text-[#8D8D8D] mt-1 italic">
                                                    {Object.entries(item.variantAttributes).map(([k, v]: any) => `${k}: ${v}`).join(' | ')}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-end mt-2">
                                                <p className="text-sm text-[#5D5D5D]">Qty: <span className="font-bold">{item.quantity}</span></p>
                                                <p className="font-serif font-bold text-[#C08C6C] text-lg">₹{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Summary & Address */}
                    <div className="space-y-6">

                        {/* Summary Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8]">
                            <h3 className="font-serif text-xl text-[#2D2D2D] mb-6">Order Summary</h3>
                            <div className="space-y-4 text-sm mb-6 pb-6 border-b border-[#F5F5F0]">
                                <div className="flex justify-between text-[#8D8D8D]">
                                    <span>Subtotal</span>
                                    <span className="text-[#2D2D2D] font-medium">₹{order.itemsPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-[#8D8D8D]">
                                    <span>Shipping</span>
                                    <span className={order.shippingPrice === 0 ? 'text-green-600 font-bold' : 'text-[#2D2D2D] font-medium'}>
                                        {order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between items-end mb-6">
                                <span className="font-medium text-[#2D2D2D]">Total</span>
                                <span className="font-serif text-2xl font-bold text-[#C08C6C]">₹{order.totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="bg-[#FDFBF7] p-4 rounded-2xl border border-[#E5E0D8] flex items-center justify-between">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D8D8D]">Method</span>
                                <span className="text-xs font-bold text-[#2D2D2D]">{order.paymentMethod}</span>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8]">
                            <h3 className="font-serif text-xl text-[#2D2D2D] mb-6 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#C08C6C]">
                                    <FaMapMarkerAlt size={14} />
                                </div>
                                Delivery
                            </h3>
                            <div className="space-y-3">
                                <p className="font-bold text-[#2D2D2D] text-lg">{order.shippingAddress.name}</p>
                                <div className="text-sm text-[#5D5D5D] leading-relaxed space-y-1">
                                    <p>{order.shippingAddress.address}</p>
                                    <p>{order.shippingAddress.locality}, {order.shippingAddress.city}</p>
                                    <p>{order.shippingAddress.state} - <span className="font-bold">{order.shippingAddress.pincode}</span></p>
                                </div>
                                <div className="pt-4 border-t border-[#F5F5F0]">
                                    <p className="text-xs font-bold uppercase tracking-widest text-[#8D8D8D] mb-1">Contact</p>
                                    <p className="text-sm text-[#2D2D2D] font-medium">{order.shippingAddress.mobile}</p>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Card if available */}
                        {order.trackingResult && order.trackingResult.id && (
                            <div className="bg-[#C08C6C] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#C08C6C]/20">
                                <h3 className="font-serif text-xl mb-4 flex items-center gap-3 uppercase tracking-wider">
                                    <FaTruck /> Tracking
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Courier</p>
                                        <p className="font-medium">{order.trackingResult.courier}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Tracking ID</p>
                                        <p className="font-mono text-sm">{order.trackingResult.id}</p>
                                    </div>
                                    {order.trackingResult.url && (
                                        <a href={order.trackingResult.url} target="_blank" rel="noopener noreferrer" className="block w-full bg-white text-[#C08C6C] py-3 rounded-xl text-center text-xs font-bold uppercase tracking-widest hover:bg-opacity-90 transition-all">
                                            Live Tracking
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
