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

                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center cursor-pointer group" onClick={() => navigate.push('/')}>
                        <div className="bg-transparent p-0 rounded-xl transition-transform duration-300 hover:scale-105">
                            <img
                                src="/logo.png"
                                alt="ApniShop Logo"
                                className="h-12 w-auto md:h-14 object-contain"
                            />
                        </div>
                    </div>

                    {/* Desktop Search Bar - Hidden on Mobile */}
                    <div className="flex-1 max-w-2xl hidden md:block relative" ref={searchRef}>
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

                    {/* Right Actions */}
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Login/User Dropdown */}
                        <div className="hidden md:block">
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
                        <Link href="/cart" className="hidden md:flex items-center gap-2 group p-2 hover:bg-[#F5F5F0] rounded-lg transition-colors relative">
                            <FaShoppingCart className="text-[#5D5D5D] group-hover:text-[#C08C6C] text-lg" />
                            <span className="text-[#2D2D2D] font-medium group-hover:text-[#C08C6C] hidden sm:block">Cart</span>
                            {mounted && cartItems.length > 0 && (
                                <span className="absolute top-1 right-1 bg-[#C08C6C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                    {cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </Link>

                        {/* Mobile Actions */}
                        <div className="md:hidden flex items-center gap-3">
                            <button
                                onClick={() => setShowMobileSearch(!showMobileSearch)}
                                className={`text-lg transition-colors ${showMobileSearch ? 'text-[#C08C6C]' : 'text-[#5D5D5D]'}`}
                            >
                                <FaSearch />
                            </button>

                            <Link href="/cart" className="relative text-[#5D5D5D]">
                                <FaShoppingCart className="text-lg" />
                                {mounted && cartItems.length > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-[#C08C6C] text-white text-[9px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full border border-white">
                                        {cartItems.length}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Mobile Search Bar - Expandable */}
                {showMobileSearch && (
                    <div className="md:hidden py-3 px-1 animate-in slide-in-from-top-2 fade-in duration-200 border-t border-[#E5E0D8]" ref={mobileSearchRef}>
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full bg-[#F9F9F5] text-[#2D2D2D] rounded-lg py-2.5 pl-10 pr-4 outline-none border border-[#E5E0D8] focus:border-[#C08C6C] focus:bg-white transition-all shadow-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                            <FaSearch className="absolute left-3.5 top-3.5 text-[#8D8D8D] text-sm" />
                        </form>

                        {/* Mobile Suggestions Dropdown */}
                        {showSuggestions && suggestions.length > 0 && (
                            <div className="absolute left-4 right-4 bg-white shadow-xl rounded-xl border border-[#E5E0D8] mt-2 overflow-hidden z-50 max-h-[60vh] overflow-y-auto">
                                {suggestions.map((item) => (
                                    <Link
                                        key={item._id}
                                        href={item.type === 'category' ? `/search?category=${encodeURIComponent(item.title)}` : `/product/${item._id}`}
                                        className="block px-4 py-3 hover:bg-[#F9F9F5] flex items-center gap-3 transition-colors border-b border-[#F5F5F0] last:border-none"
                                        onClick={() => {
                                            setShowSuggestions(false);
                                            setShowMobileSearch(false);
                                        }}
                                    >
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-10 h-10 object-cover rounded-md" />
                                        ) : (
                                            <FaSearch className="text-[#8D8D8D] text-xs flex-shrink-0" />
                                        )}
                                        <div>
                                            <span className="text-[#2D2D2D] text-sm font-medium line-clamp-1 block">{item.title}</span>
                                            {item.type === 'category' && <span className="text-[10px] text-[#C08C6C] uppercase font-bold tracking-wider">Category</span>}
                                        </div>
                                        {item.type !== 'category' && <span className="text-xs text-[#8D8D8D] ml-auto uppercase flex-shrink-0 bg-[#F5F5F0] px-2 py-0.5 rounded">{item.category}</span>}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
