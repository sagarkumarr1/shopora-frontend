'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import orderService from '@/services/orderService';
import { FaSpinner, FaArrowLeft, FaShoppingCart } from 'react-icons/fa';
import Image from 'next/image';

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
            <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
                <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8] w-full max-w-md">
                    <h2 className="font-serif text-3xl text-[#2D2D2D] mb-4">Order Not Found</h2>
                    <p className="text-[#8D8D8D] mb-8">We couldn't find the details for this order.</p>
                    <Link href="/" className="bg-[#C08C6C] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#A06C4C] transition-all w-full block">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full max-w-lg mx-auto md:max-w-2xl md:bg-white md:p-12 md:rounded-[2.5rem] md:shadow-2xl md:shadow-[#C08C6C]/10 md:border md:border-[#E5E0D8] transition-all duration-300">
            {/* Illustration */}
            <div className="relative w-64 h-64 md:w-80 md:h-80 mb-6 animate-fade-in-up">
                {/* Fallback to checkmark if image missing, but try to use image */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <Image
                        src="/order_success_box_3d.png"
                        alt="Order Confirmed"
                        width={320}
                        height={320}
                        className="object-contain drop-shadow-2xl"
                        priority
                    />
                </div>
            </div>

            <h2 className="font-serif text-3xl md:text-5xl text-[#3E3E3E] mb-3 font-medium text-center tracking-tight">
                Order Confirmed!
            </h2>
            <p className="text-[#9A9A9A] mb-8 text-center text-sm md:text-lg font-light px-8">
                Your order has been successfully placed
            </p>

            <div className="mb-10 text-center space-y-2">
                <p className="text-[#8D8D8D] text-sm md:text-base">Order number: <span className="font-semibold text-[#5A5A5A] uppercase tracking-wider">#{order._id?.slice(-8) || '123456'}</span></p>
                <p className="text-[#8D8D8D] text-sm md:text-base">Thank you for shopping with us!</p>
            </div>

            <div className="flex gap-4 w-full px-4 md:px-0">
                <Link href={`/account/orders`} className="flex-1 bg-[#F5F0EB] text-[#5A4A42] px-4 py-4 rounded-2xl font-medium text-center hover:bg-[#EDE5DE] transition-colors md:text-lg">
                    View Order
                </Link>
                <Link href="/" className="flex-1 bg-[#C08C6C] text-white px-4 py-4 rounded-2xl font-medium text-center hover:bg-[#A87555] shadow-lg shadow-[#C08C6C]/20 transition-all md:text-lg">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default function OrderSuccess() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans">
            {/* Desktop Navbar - Hidden on Mobile */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* Mobile Header - Visible only on Mobile */}
            <div className="md:hidden fixed top-0 left-0 right-0 p-4 flex justify-between items-center z-50 bg-[#FDFBF7]/80 backdrop-blur-sm">
                <Link href="/" className="p-2 text-[#4A4A4A]">
                    <FaArrowLeft className="text-xl" />
                </Link>
                <Link href="/cart" className="p-2 text-[#4A4A4A] relative">
                    <FaShoppingCart className="text-xl" />
                    {/* Badge could go here if we had access to cart state easily, skipping for simplicity in this view */}
                    <span className="absolute top-1 right-0 bg-[#C08C6C] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                        0
                    </span>
                </Link>
            </div>

            <div className="pt-20 md:pt-32 pb-24 flex flex-col items-center justify-center px-4 min-h-[90vh]">
                <Suspense fallback={<div className="text-[#C08C6C]">Loading...</div>}>
                    <OrderSuccessContent />
                </Suspense>
            </div>
        </main>
    );
}
