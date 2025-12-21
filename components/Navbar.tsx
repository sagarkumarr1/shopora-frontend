'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCart } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaUser, FaStore, FaSignOutAlt } from 'react-icons/fa';
import { IoIosArrowDown } from "react-icons/io";
import productService from '@/services/productService';

export default function Navbar() {
    const navigate = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const { user } = useSelector((state: RootState) => state.auth);
    const { cartItems } = useSelector((state: RootState) => state.cart);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mounted, setMounted] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const mobileSearchRef = useRef<HTMLDivElement>(null);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleProfileEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowProfileMenu(true);
    };

    const handleProfileLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowProfileMenu(false);
        }, 300); // 300ms delay before closing
    };




    // ... inside component
    useEffect(() => {
        setMounted(true);
        if (user) {
            dispatch(fetchCart());
        }
    }, [user, dispatch]);

    const onLogout = () => {
        dispatch(logout());
        dispatch(reset());
        navigate.push('/');
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            setShowSuggestions(false);
            navigate.push(`/search?q=${encodeURIComponent(searchTerm)}`);
        }
    };

    // Debounced search suggestions
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                try {
                    const res = await productService.getSuggestions(searchTerm);
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error(error);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (
                searchRef.current &&
                !searchRef.current.contains(target) &&
                mobileSearchRef.current &&
                !mobileSearchRef.current.contains(target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 font-sans top-0 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">
                <div className="flex justify-between items-center h-14 md:h-20 gap-4 md:gap-8">

                    {/* Mobile Header - Reference Style */}
                    <div className="md:hidden flex flex-col w-full pb-2">
                        {/* Top Row: Menu - Title - Cart */}
                        <div className="flex justify-between items-center h-14 px-2">
                            {/* Hamburger / Menu */}
                            <button
                                onClick={() => setShowMobileMenu(true)}
                                className="p-2 text-[#5D5D5D]"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                                </svg>
                            </button>

                            {/* Centered Logo Text */}
                            <Link href="/" className="font-serif text-3xl text-[#8B5E3C] tracking-tight">
                                ApnaShop
                            </Link>

                            {/* Cart Icon */}
                            <Link href="/cart" className="relative p-2 text-[#5D5D5D]">
                                <FaShoppingCart className="text-xl" />
                                {mounted && cartItems.length > 0 && (
                                    <span className="absolute top-1 right-0 bg-[#C08C6C] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                        {cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                                    </span>
                                )}
                            </Link>
                        </div>

                        {/* Search Bar Row */}
                        <div className="px-2 mt-1 relative">
                            <form onSubmit={handleSearch} className="relative">
                                <input
                                    type="text"
                                    placeholder="Search products"
                                    className="w-full bg-[#FAFAFA] text-[#2D2D2D] rounded-full py-3.5 pl-12 pr-12 outline-none border border-transparent shadow-sm focus:border-[#C08C6C]/30 focus:bg-white transition-all text-sm placeholder:text-[#9CA3AF]"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {/* Search Icon Left */}
                                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg" />

                                {/* Filter Icon Right (Visual mostly) */}
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white rounded-full shadow-sm border border-gray-100 cursor-pointer text-[#C08C6C]">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                                        <path d="M18.75 12.75h1.5a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5zM12 6a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 6zM12 18a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 0112 18zM3.75 6.75h1.5a.75.75 0 100-1.5h-1.5a.75.75 0 000 1.5zM5.25 18.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 010 1.5zM3 12a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5A.75.75 0 013 12zM9 3.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5zM12.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0zM9 15.75a2.25 2.25 0 100 4.5 2.25 2.25 0 000-4.5z" />
                                    </svg>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Mobile Menu Drawer (Left Side) */}
                    {showMobileMenu && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />
                            <div className="absolute left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-white shadow-2xl animate-in slide-in-from-left duration-300">
                                <div className="p-6 bg-[#FDFBF7] border-b border-[#E5E0D8] flex items-center justify-between">
                                    <h2 className="font-serif text-2xl text-[#C08C6C]">ApnaShop</h2>
                                    <button onClick={() => setShowMobileMenu(false)} className="w-8 h-8 flex items-center justify-center bg-white rounded-full shadow-sm text-[#8D8D8D]">
                                        ✕
                                    </button>
                                </div>
                                <div className="p-4 space-y-2">
                                    <Link href="/" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-lg hover:bg-[#F9F9F5] font-medium text-[#2D2D2D] flex items-center gap-3">
                                        <FaStore className="text-[#C08C6C]" /> Home
                                    </Link>
                                    <Link href="/search?sort=newest" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-lg hover:bg-[#F9F9F5] font-medium text-[#2D2D2D] flex items-center gap-3">
                                        <FaSearch className="text-[#C08C6C]" /> Explore
                                    </Link>
                                    <Link href="/account" onClick={() => setShowMobileMenu(false)} className="block px-4 py-3 rounded-lg hover:bg-[#F9F9F5] font-medium text-[#2D2D2D] flex items-center gap-3">
                                        <FaUser className="text-[#C08C6C]" /> Account
                                    </Link>
                                    {user && (
                                        <button onClick={() => { onLogout(); setShowMobileMenu(false); }} className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-50 font-medium text-red-600 flex items-center gap-3">
                                            <FaSignOutAlt /> Logout
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
        </nav>
    );
}
