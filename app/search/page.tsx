'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import { IoIosArrowDown, IoMdSearch, IoMdClose } from "react-icons/io";
import { FaArrowLeft, FaFilter, FaShoppingCart } from 'react-icons/fa';
import productService from '@/services/productService';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category');
    const { cartItems } = useSelector((state: RootState) => state.cart);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('relevance');
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    // Determines if this is a Category View or Search View
    const isCategoryView = !!categoryParam && !initialQuery;
    const pageTitle = categoryParam || "Search Results";

    // Update query state if URL changes
    useEffect(() => {
        setSearchQuery(initialQuery);
    }, [initialQuery]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
    };

    // Fetch Products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            try {
                const params: any = {
                    keyword: searchParams.get('q') || '',
                    category: searchParams.get('category') || '',
                    maxPrice: searchParams.get('maxPrice') || '',
                    rating: searchParams.get('rating') || '',
                    sort: sortBy
                };

                const res = await productService.getProducts(params);
                setProducts(res.data);
            } catch (error) {
                console.error("Failed to fetch products", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [searchParams, sortBy]);


    return (
        <>
            {/* Mobile Fixed Header & Controls */}
            <div className={`md:hidden fixed top-0 left-0 right-0 bg-white z-50 shadow-sm ${isCategoryView ? '' : 'rounded-b-[2rem]'}`}>

                {/* Row 1: Header (Search vs Category) */}
                {isCategoryView ? (
                    // CATEGORY HEADER
                    <div className="flex items-center justify-between p-4 pb-2">
                        <button onClick={() => router.back()} className="text-[#5D5D5D] p-1">
                            <FaArrowLeft className="text-lg" />
                        </button>
                        <h1 className="text-lg font-bold text-[#2D2D2D] capitalize">{pageTitle}</h1>
                        <button onClick={() => router.push('/cart')} className="relative text-[#5D5D5D] p-1">
                            <FaShoppingCart className="text-xl" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-[#C08C6C] text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-white">
                                    {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                                </span>
                            )}
                        </button>
                    </div>
                ) : (
                    // SEARCH HEADER
                    <div className="flex items-center gap-3 p-4 pb-2">
                        <button onClick={() => router.back()} className="text-[#5D5D5D] p-1">
                            <FaArrowLeft className="text-lg" />
                        </button>
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                            <IoMdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D8D8D] text-lg" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#F9F9F5] rounded-full py-3 pl-12 pr-10 text-[#2D2D2D] text-sm font-medium border border-[#E5E0E0] outline-none focus:border-[#C08C6C]"
                                placeholder="Search..."
                            />
                            {searchQuery && (
                                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8D8D] p-1">
                                    <IoMdClose />
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Category Breadcrumbs & Title & Pills */}
                {isCategoryView && (
                    <div className="px-4 pb-2">
                        {/* Breadcrumb */}
                        <div className="flex items-center gap-2 text-xs text-[#8D8D8D] mb-4">
                            <span>Home</span>
                            <span>/</span>
                            <span className="capitalize text-[#2D2D2D] font-medium">{categoryParam}</span>
                        </div>

                        {/* Big Title & Count */}
                        <div className="mb-4">
                            <h2 className="font-serif text-3xl text-[#8B5E3C] capitalize mb-1">{categoryParam}</h2>
                            <p className="text-xs text-[#8D8D8D] font-medium">{products.length} results</p>
                        </div>

                        {/* Pills (Mock Categories for Visuals - as per design, keeping them static for now but they act as sub-filters if implemented) */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                            {['All', 'Jackets', 'T-Shirts', 'Shirts', 'Trousers', 'Shoes'].map((sub, idx) => (
                                <button
                                    key={sub}
                                    className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${idx === 0 ? 'bg-[#ae856b] text-white border-[#ae856b]' : 'bg-[#F9F9F5] text-[#5D5D5D] border-[#E5E0D8]'}`}
                                >
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Row 2: Filter/Sort Controls */}
                <div className="px-4 pb-4">
                    {!isCategoryView && <p className="text-xs text-[#8D8D8D] mb-3 ml-1">{products.length} Results found for '{searchParams.get('q')}'</p>}

                    <div className="flex gap-3">
                        {/* Filter Button */}
                        <button className="flex-1 flex items-center justify-center gap-2 bg-[#F9F9F5] border border-[#E5E0D8] py-2.5 rounded-xl text-[#2D2D2D] text-sm font-bold">
                            <div className="relative">
                                <FaFilter className="text-[#C08C6C] text-xs" />
                                {/* Dot indicator if active */}
                            </div>
                            Filter
                        </button>

                        {/* Sort Button/Dropdown */}
                        <div className="flex-1 relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="w-full appearance-none bg-[#F9F9F5] border border-[#E5E0D8] py-2.5 pl-4 pr-8 rounded-xl text-[#2D2D2D] text-sm font-bold focus:outline-none focus:border-[#C08C6C] text-center"
                            >
                                <option value="relevance">Sort: Relevance</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#8D8D8D]">
                                <IoIosArrowDown />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Wrapper */}
            <div className={`max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-8 ${isCategoryView ? 'pt-[320px]' : 'pt-[160px]'} md:pt-32`}>

                {/* Sidebar (Desktop) */}
                <div className="hidden lg:block w-72 flex-shrink-0">
                    <FilterSidebar />
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Desktop Header & Sort (Hidden on Mobile) */}
                    <div className="hidden md:flex bg-white p-6 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8] rounded-[2rem] mb-8 justify-between items-center gap-4">
                        <span className="font-serif text-[#2D2D2D] text-lg">
                            {isCategoryView ? `Browsing ${categoryParam}` : `Showing results for search`}
                            <span className="font-bold text-[#C08C6C] ml-2">({products.length})</span>
                        </span>

                        <div className="flex items-center gap-3">
                            <span className="text-[#8D8D8D] text-sm font-medium uppercase tracking-wider">Sort By</span>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-[#F9F9F5] border border-[#E5E0D8] text-[#2D2D2D] py-2 px-6 pr-10 rounded-xl leading-tight focus:outline-none focus:border-[#C08C6C] cursor-pointer text-sm font-bold"
                                >
                                    <option value="relevance">Relevance</option>
                                    <option value="price_low">Price: Low to High</option>
                                    <option value="price_high">Price: High to Low</option>
                                    <option value="newest">Newest First</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#C08C6C]">
                                    <IoIosArrowDown />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C08C6C]"></div>
                        </div>
                    ) : products.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product._id}
                                    product={{ ...product, showAddToCart: true }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white p-16 text-center rounded-[2.5rem] shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8] flex flex-col items-center">
                            <div className="w-20 h-20 bg-[#F5F5F0] rounded-full flex items-center justify-center mb-6">
                                <IoMdSearch className="text-4xl text-[#C08C6C]" />
                            </div>
                            <h2 className="text-3xl font-serif text-[#2D2D2D] mb-3">No products found</h2>
                            <p className="text-[#8D8D8D] max-w-sm mx-auto mb-8">We couldn't find matches for your search. Try checking your spelling or using different keywords.</p>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="bg-[#2D2D2D] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                            >
                                Browse All Products
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default function SearchPage() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-12 font-sans overflow-x-hidden">
            <div className="hidden md:block">
                <Navbar />
            </div>
            <Suspense fallback={<div className="pt-32 text-center text-[#C08C6C]">Loading...</div>}>
                <SearchContent />
            </Suspense>
        </main>
    );
}
