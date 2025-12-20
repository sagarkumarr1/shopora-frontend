'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function BottomNav() {
    const pathname = usePathname();
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Hide on desktop (md and up) and on checkout page
    if (pathname === '/checkout') return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 bg-white/90 backdrop-blur-lg border border-white/20 shadow-2xl shadow-[#C08C6C]/10 py-3 px-6 flex justify-between items-center z-50 md:hidden rounded-[2rem]">
            <Link href="/" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/' ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}>
                <FaHome className="text-xl" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Home</span>
            </Link>

            <Link href="/search" className={`flex flex-col items-center gap-1 transition-colors ${pathname === '/search' ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}>
                <FaSearch className="text-xl" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Search</span>
            </Link>

            <Link href="/cart" className={`relative flex flex-col items-center gap-1 transition-colors ${pathname === '/cart' ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}>
                <div className="relative">
                    <FaShoppingCart className="text-xl" />
                    {mounted && cartItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-[#C08C6C] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white shadow-sm">
                            {cartItems.length}
                        </span>
                    )}
                </div>
                <span className="text-[10px] font-medium tracking-wide">Cart</span>
            </Link>

            <Link href="/account" className={`flex flex-col items-center gap-1 transition-colors ${pathname.startsWith('/account') ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}>
                <FaUser className="text-xl" />
                <span className="text-[10px] font-bold tracking-wide uppercase">Account</span>
            </Link>
        </div>
    );
}
