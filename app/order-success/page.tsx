'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import orderService from '@/services/orderService';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';

// Helper component to wrap useSearchParams for Suspense
function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (orderId) {
            orderService.getOrderById(orderId)
                .then((res) => {
                    setOrder(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [orderId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <FaSpinner className="animate-spin text-4xl text-[#C08C6C] mb-4" />
                <p className="text-[#8D8D8D]">Loading order details...</p>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-[#C08C6C]/10 border border-[#E5E0D8] text-center max-w-md w-full">
                <h2 className="font-serif text-3xl text-[#2D2D2D] mb-4">Order Not Found</h2>
                <p className="text-[#8D8D8D] mb-8">We couldn't find the details for this order.</p>
                <Link href="/" className="bg-[#C08C6C] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#A06C4C] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#C08C6C]/20 inline-block w-full">
                    Continue Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-[#C08C6C]/10 border border-[#E5E0D8] text-center max-w-2xl w-full mx-4">
            <div className="flex justify-center mb-8">
                <FaCheckCircle className="text-[5rem] text-green-600 drop-shadow-xl" />
            </div>

            <h2 className="font-serif text-3xl md:text-4xl text-[#2D2D2D] mb-3 font-medium">Order Placed Successfully!</h2>
            <p className="text-[#8D8D8D] mb-10 text-lg">Thank you for shopping with us.</p>

            <div className="bg-[#F9F9F5] p-8 rounded-2xl text-left mb-10 border border-[#E5E0D8]">
                <div className="flex justify-between mb-4 border-b border-[#E5E0D8] pb-4 last:border-0 last:pb-0">
                    <span className="text-[#8D8D8D] font-medium">Order ID:</span>
                    <span className="font-mono font-bold text-[#2D2D2D] tracking-wide text-sm md:text-base">{order._id}</span>
                </div>
                <div className="flex justify-between mb-4 border-b border-[#E5E0D8] pb-4">
                    <span className="text-[#8D8D8D] font-medium">Status:</span>
                    <span className="font-bold text-green-600 uppercase tracking-wider">{order.orderStatus || 'PENDING'}</span>
                </div>
                <div className="flex justify-between mb-4 border-b border-[#E5E0D8] pb-4">
                    <span className="text-[#8D8D8D] font-medium">Payment Method:</span>
                    <span className="font-bold text-[#2D2D2D] uppercase">{order.paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-2 items-center">
                    <span className="text-[#2D2D2D] font-bold text-lg">Total Amount:</span>
                    <span className="font-bold text-[#2D2D2D] text-2xl font-serif">₹{order.totalPrice?.toLocaleString()}</span>
                </div>
            </div>

            <Link href="/" className="bg-[#C08C6C] text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-[#A06C4C] transition-all transform hover:-translate-y-1 shadow-lg shadow-[#C08C6C]/20 inline-block w-full">
                Continue Shopping
            </Link>
        </div>
    );
}

export default function OrderSuccess() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans">
            <Navbar />
            <div className="pt-32 pb-20 flex flex-col items-center justify-center px-4 min-h-[90vh]">
                <Suspense fallback={<div className="text-[#C08C6C]">Loading...</div>}>
                    <OrderSuccessContent />
                </Suspense>
            </div>
        </main>
    );
}
