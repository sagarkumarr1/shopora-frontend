'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaThLarge, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

export default function BottomNav() {
    const pathname = usePathname();
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const cartCount = cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0);

    // Hide BottomNav on Order Success page
    if (pathname?.startsWith('/order-success')) {
        return null;
    }

    const navItems = [
        { name: 'Home', href: '/', icon: FaHome },
        { name: 'Categories', href: '/categories', icon: FaThLarge }, // Determine if we want a dedicated cats page or just search
        { name: 'Cart', href: '/cart', icon: FaShoppingCart, badge: cartCount },
        { name: 'Account', href: '/account', icon: FaUser },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 pb-safe-area-inset-bottom">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-[#C08C6C]' : 'text-[#8D8D8D]'}`}
                        >
                            <div className="relative">
                                <Icon className={`text-xl ${isActive ? 'scale-110' : ''} transition-transform`} />
                                {item.badge ? (
                                    <span className="absolute -top-2 -right-2 bg-[#C08C6C] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </div>
                            <span className="text-[10px] font-bold tracking-wide">{item.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
