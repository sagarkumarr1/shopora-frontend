'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logout, reset } from '@/store/authSlice';
import { RootState, AppDispatch } from '@/store/store';
import { fetchCart } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import { FaSearch, FaShoppingCart, FaUser, FaStore, FaSignOutAlt } from 'react-icons/fa';
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
    const [showMobileSearch, setShowMobileSearch] = useState(false); // Kept for state compatibility, though new mobile design has persistent search

    return (
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-stone-100 font-sans top-0 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 lg:px-6">

                {/* ============================== */}
                {/*        DESKTOP NAVBAR          */}
                {/* ============================== */}
                <div className="hidden md:flex justify-between items-center h-20 gap-8">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => navigate.push('/')}>
                        <div className="bg-transparent p-0 rounded-xl transition-transform duration-300 hover:scale-105">
                            <img
                                src="/logo.png"
                                alt="ApniShop Logo"
                                className="h-14 w-auto object-contain"
                            />
                        </div>
                    </div>

                    {/* Desktop Search Bar */}
                    <div className="flex-1 max-w-2xl relative" ref={searchRef}>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search for products, brands and more"
                                className="w-full bg-[#F9F9F5] text-[#2D2D2D] rounded-lg py-2.5 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#C08C6C] focus:bg-white transition-all border border-[#E5E0D8] focus:border-[#C08C6C]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                            />
                            <FaSearch className="absolute left-3.5 top-3.5 text-[#8D8D8D] text-sm" />
                        </form>

                        {/* Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-b-lg border border-[#E5E0D8] mt-1 overflow-hidden z-50">
                                {suggestions.map((item) => (
                                    <Link
                                        key={item._id}
                                        href={`/product/${item._id}`}
                                        className="block px-4 py-2 hover:bg-[#F9F9F5] flex items-center gap-3 transition-colors"
                                        onClick={() => setShowSuggestions(false)}
                                    >
                                        <FaSearch className="text-[#8D8D8D] text-xs" />
                                        <span className="text-[#2D2D2D] text-sm font-medium">{item.title}</span>
                                        <span className="text-xs text-[#8D8D8D] ml-auto uppercase">{item.category}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Desktop Right Actions */}
                    <div className="flex items-center gap-6">
                        {/* Login/User Dropdown */}
                        <div>
                            {mounted && user ? (
                                <div
                                    className="relative cursor-pointer flex items-center gap-2 py-2"
                                    onMouseEnter={handleProfileEnter}
                                    onMouseLeave={handleProfileLeave}
                                >
                                    <div className="w-8 h-8 bg-[#F5F5F0] rounded-full flex items-center justify-center text-[#C08C6C] font-bold border border-[#E5E0D8]">
                                        {user?.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <span className="text-[#2D2D2D] font-medium hidden sm:block">{user?.name || 'User'}</span>

                                    {/* Dropdown Menu */}
                                    {showProfileMenu && (
                                        <div className="absolute top-full right-0 mt-0 pt-2 w-48 z-50">
                                            <div className="bg-white rounded-lg shadow-xl border border-[#E5E0D8] overflow-hidden">
                                                <div className="py-1">
                                                    {user.role === 'admin' && (
                                                        <Link href="/admin" className="block px-4 py-2 text-sm text-[#2D2D2D] hover:bg-[#F9F9F5] font-bold text-[#C08C6C]">Admin Panel</Link>
                                                    )}
                                                    <Link href="/account" className="block px-4 py-2 text-sm text-[#5D5D5D] hover:bg-[#F9F9F5]">My Profile</Link>
                                                    <button onClick={onLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                                        <FaSignOutAlt /> Logout
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <Link href="/login" className="flex items-center gap-2 group p-2 hover:bg-[#F5F5F0] rounded-lg transition-colors">
                                    <FaUser className="text-[#5D5D5D] group-hover:text-[#C08C6C]" />
                                    <span className="text-[#2D2D2D] font-medium group-hover:text-[#C08C6C]">Login</span>
                                </Link>
                            )}
                        </div>

                        {/* Cart */}
                        <Link href="/cart" className="flex items-center gap-2 group p-2 hover:bg-[#F5F5F0] rounded-lg transition-colors relative">
                            <FaShoppingCart className="text-[#5D5D5D] group-hover:text-[#C08C6C] text-lg" />
                            <span className="text-[#2D2D2D] font-medium group-hover:text-[#C08C6C]">Cart</span>
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute top-1 right-1 bg-[#C08C6C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                    {cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>


                {/* ============================== */}
                {/*        MOBILE NAVBAR           */}
                {/* ============================== */}
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

                    {/* Mobile Menu Drawer (Left Side) - Only conditionally rendered */}
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

            </div>
        </nav>
    );
}
