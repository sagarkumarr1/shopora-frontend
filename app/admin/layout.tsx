'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { useEffect, useState } from 'react';
import { FaBox, FaChartLine, FaClipboardList, FaSignOutAlt, FaUsers, FaBars, FaTimes, FaTags, FaImages, FaStar } from 'react-icons/fa';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (user && user.role !== 'admin') {
            router.push('/');
        }
        if (!user && isMounted) {
            router.push('/login');
        }
    }, [user, router, isMounted]);

    if (!isMounted) {
        return null;
    }

    if (!user || user.role !== 'admin') {
        return null;
    }

    const menuItems = [
        { name: 'Dashboard', path: '/admin', icon: <FaChartLine /> },
        { name: 'Products', path: '/admin/products', icon: <FaBox /> },
        { name: 'Categories', path: '/admin/categories', icon: <FaTags /> },
        { name: 'Reviews', path: '/admin/reviews', icon: <FaStar /> },
        { name: 'Hero Banners', path: '/admin/hero', icon: <FaImages /> },
        { name: 'Orders', path: '/admin/orders', icon: <FaClipboardList /> },
        { name: 'Users', path: '/admin/users', icon: <FaUsers /> },
    ];

    return (
        <div className="flex h-screen bg-gray-100 text-gray-900 font-sans">
            {/* Mobile Sidebar Toggle */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#C08C6C] text-white flex items-center px-4 justify-between z-20 shadow-md">
                <div className="font-bold text-xl font-serif">Admin Panel</div>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                    {isSidebarOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 bg-white w-64 shadow-lg transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-200 ease-in-out z-10 md:static md:flex flex-col border-r border-[#E5E0D8]`}>
                <div className="h-16 flex items-center justify-center border-b border-[#E5E0D8] font-bold text-2xl text-[#C08C6C] font-serif">
                    ApniShop<span className="text-xs text-[#8D8D8D] ml-1 font-sans tracking-wide">Admin</span>
                </div>

                <div className="p-4">
                    <div className="flex items-center gap-3 mb-6 px-2">
                        <div className="w-10 h-10 bg-[#F5F5F0] rounded-full flex items-center justify-center text-[#C08C6C] font-bold border border-[#E5E0D8]">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-bold text-gray-800">{user.name}</div>
                            <div className="text-xs text-gray-500">Administrator</div>
                        </div>
                    </div>

                    <nav className="space-y-1">
                        {menuItems.map((item) => (
                            <Link
                                key={item.path}
                                href={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${pathname === item.path ? 'bg-[#C08C6C] text-white shadow-md shadow-[#C08C6C]/20 font-medium' : 'text-[#5D5D5D] hover:bg-[#F5F5F0] hover:text-[#2D2D2D]'}`}
                            >
                                {item.icon}
                                <span>{item.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="mt-auto p-4 border-t border-[#E5E0D8]">
                    <Link href="/" className="flex items-center gap-3 px-4 py-3 text-[#5D5D5D] hover:text-[#C08C6C] transition-colors font-medium">
                        <FaSignOutAlt />
                        <span>Exit Admin</span>
                    </Link>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 p-6">
                {children}
            </main>

            {/* Overlay for mobile sidebar */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>
            )}
        </div>
    );
}
