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

// ... imports remain the same

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category');
    const { cartItems } = useSelector((state: RootState) => state.cart);

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false); // Changed to false initially
    const [sortBy, setSortBy] = useState('relevance');
    const [searchQuery, setSearchQuery] = useState(initialQuery);

    // Suggestion & Recent Search State
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [suggestionLoading, setSuggestionLoading] = useState(false);

    // Determines if this is a Category View or Search View
    const isCategoryView = !!categoryParam && !initialQuery;
    const pageTitle = categoryParam || "Search Results";

    // Load recent searches on mount
    useEffect(() => {
        const stored = localStorage.getItem('recentSearches');
        if (stored) {
            setRecentSearches(JSON.parse(stored));
        }
    }, []);

    // Update query state if URL changes
    useEffect(() => {
        setSearchQuery(initialQuery);
        // If query exists in URL, we are showing results, so likely not focusing input unless user taps it
        if (initialQuery) {
            setShowSuggestions(false);
            fetchProducts(initialQuery);
            setIsInputFocused(false);
        } else if (!categoryParam) { // If no query and no category, focus input
            setIsInputFocused(true);
        }
    }, [initialQuery, categoryParam]);

    // Live Suggestions with Debounce
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.trim().length > 1 && isInputFocused) {
                setSuggestionLoading(true);
                try {
                    const res = await productService.getSuggestions(searchQuery);
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                } catch (error) {
                    console.error(error);
                } finally {
                    setSuggestionLoading(false);
                }
            } else {
                setSuggestions([]);
                if (!searchQuery.trim()) {
                    setShowSuggestions(false);
                }
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, isInputFocused]);


    const handleSearchSubmit = (e: React.FormEvent | string) => {
        if (typeof e !== 'string') e.preventDefault();
        const queryToSearch = typeof e === 'string' ? e : searchQuery;

        if (queryToSearch.trim()) {
            // Save to recent searches
            const updatedRecent = [queryToSearch, ...recentSearches.filter(s => s !== queryToSearch)].slice(0, 5);
            setRecentSearches(updatedRecent);
            localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

            setShowSuggestions(false);
            setIsInputFocused(false);
            router.push(`/search?q=${encodeURIComponent(queryToSearch)}`);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setIsInputFocused(true); // Keep focus to show recent searches
        setShowSuggestions(false);
        setProducts([]); // Clear current results if any
    };

    const removeRecentSearch = (e: React.MouseEvent, item: string) => {
        e.stopPropagation();
        const updated = recentSearches.filter(s => s !== item);
        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    }

    const fetchProducts = async (query: string) => {
        setLoading(true);
        try {
            const params: any = {
                keyword: query,
                category: categoryParam || '',
                sort: sortBy // Use current sort by
            };
            const res = await productService.getProducts(params);
            setProducts(res.data);
        } catch (error) {
            console.error("Failed to fetch products", error);
        } finally {
            setLoading(false);
        }
    };

    // Sort effect
    useEffect(() => {
        if (initialQuery || categoryParam) {
            // Re-fetch only if we are in results mode
            const query = initialQuery || '';
            // We need to call fetch here manually or depend on effect. 
            // Logic reuse: 
            setLoading(true);
            productService.getProducts({
                keyword: query,
                category: categoryParam || '',
                sort: sortBy
            }).then(res => {
                setProducts(res.data);
                setLoading(false);
            }).catch(err => setLoading(false));
        }
    }, [sortBy]);


    // Determine what to show in Mobile Content Area
    // If (isInputFocused OR !initialQuery) AND !categoryParam -> Show Entry Mode (Recent/Suggestions)
    // Else -> Show Results
    // Actually, "Results Page" requirements say "Input remains visible and editable".
    // So distinct modes are: 
    // 1. "Typing/Entry" (Suggestions Overlay or Recent Searches)
    // 2. "Results" (Product Grid)

    // If user clicks input, we enter "Entry Mode".
    const showEntryMode = (isInputFocused || (!initialQuery && !categoryParam));


    return (
        <>
            {/* Mobile Fixed Header & Controls */}
            <div className={`md:hidden fixed top-0 left-0 right-0 bg-white z-50 shadow-sm ${isCategoryView ? '' : 'rounded-b-[2rem]'} transition-all`}>

                {/* Row 1: Header (Search vs Category) */}
                {isCategoryView ? (
                    // CATEGORY HEADER (Unchanged mostly)
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
                    // SEARCH HEADER (Modified for Requirements)
                    <div className="flex items-center gap-3 p-4 pb-2">
                        {/* Back button only if we have results or user wants to exit search focus */}
                        <button onClick={() => router.back()} className="text-[#5D5D5D] p-1">
                            <FaArrowLeft className="text-lg" />
                        </button>
                        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
                            <IoMdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D8D8D] text-lg" />
                            <input
                                autoFocus={!initialQuery} // Body of prompt said "Search input auto-focused" on entry
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setIsInputFocused(true)}
                                // We don't onBlur immediately because clicking suggestions needs to fire first
                                className="w-full bg-[#F9F9F5] rounded-full py-3.5 pl-12 pr-10 text-[#2D2D2D] text-sm font-medium border border-[#E5E0E0] outline-none focus:border-[#C08C6C] shadow-sm"
                                placeholder="Search for products, brands & categories"
                            />
                            {searchQuery && (
                                <button type="button" onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8D8D8D] p-1.5 hover:bg-gray-100 rounded-full">
                                    <IoMdClose />
                                </button>
                            )}
                        </form>
                    </div>
                )}

                {/* Sub-Header Elements (Category Breadcrumbs or Filters) */}
                {/* Only show Filters if NOT in Entry Mode and IS showing results */}
                {!showEntryMode && !isCategoryView && (
                    <div className="px-4 pb-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-xs text-[#8D8D8D] mb-3 ml-1">
                            {products.length > 0 ? `Showing results for '${initialQuery}'` : `No results for '${initialQuery}'`}
                        </p>
                        <div className="flex gap-3">
                            <button className="flex-1 flex items-center justify-center gap-2 bg-[#F9F9F5] border border-[#E5E0D8] py-2.5 rounded-xl text-[#2D2D2D] text-sm font-bold">
                                <FaFilter className="text-[#C08C6C] text-xs" /> Filter
                            </button>
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
                )}

                {/* Category View Extras (breadcrumbs etc) */}
                {isCategoryView && !showEntryMode && (
                    <div className="px-4 pb-2">
                        {/* Use existing category view structure */}
                        <div className="flex items-center gap-2 text-xs text-[#8D8D8D] mb-4">
                            <span>Home</span><span>/</span><span className="capitalize text-[#2D2D2D] font-medium">{categoryParam}</span>
                        </div>
                        <div className="mb-4">
                            <h2 className="font-serif text-3xl text-[#8B5E3C] capitalize mb-1">{categoryParam}</h2>
                            <p className="text-xs text-[#8D8D8D] font-medium">{products.length} results</p>
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                            {['All', 'Jackets', 'T-Shirts', 'Shirts', 'Trousers', 'Shoes'].map((sub, idx) => (
                                <button key={sub} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${idx === 0 ? 'bg-[#ae856b] text-white border-[#ae856b]' : 'bg-[#F9F9F5] text-[#5D5D5D] border-[#E5E0D8]'}`}>
                                    {sub}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Wrapper */}
            <div className={`max-w-[1600px] mx-auto p-4 md:p-6 flex flex-col lg:flex-row gap-8 ${isCategoryView ? 'pt-[320px]' : (showEntryMode ? 'pt-[90px]' : 'pt-[180px]')} md:pt-32`}>

                {/* 1. ENTRY MODE CONTENT (Suggestions / Recent) */}
                {showEntryMode && (
                    <div className="flex-1 md:hidden animate-in fade-in duration-200">
                        {/* Suggestion Loader */}
                        {suggestionLoading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#C08C6C] border-t-transparent"></div>
                            </div>
                        )}

                        {/* Live Suggestions */}
                        {!suggestionLoading && searchQuery.trim() && suggestions.length > 0 && (
                            <div className="mb-8">
                                {suggestions.map((item) => (
                                    <div
                                        key={item._id}
                                        onClick={() => handleSearchSubmit(item.title)}
                                        className="flex items-center gap-3 py-4 border-b border-[#F5F5F0] active:bg-[#F9F9F5]"
                                    >
                                        <IoMdSearch className="text-[#8D8D8D] text-lg" />
                                        <span className="text-[#2D2D2D] text-sm font-medium">{item.title}</span>
                                        <span className="text-xs text-[#8D8D8D] ml-auto uppercase">{item.category}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Recent Searches */}
                        {!searchQuery.trim() && recentSearches.length > 0 && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-sm font-bold text-[#2D2D2D]">Recent Searches</h3>
                                    <button onClick={() => { setRecentSearches([]); localStorage.removeItem('recentSearches'); }} className="text-xs text-[#C08C6C] font-bold">Clear all</button>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {recentSearches.map((term, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => handleSearchSubmit(term)}
                                            className="px-4 py-2 bg-white border border-[#E5E0D8] rounded-full text-xs text-[#5D5D5D] font-medium flex items-center gap-2 active:bg-[#F5F5F0]"
                                        >
                                            {term}
                                            <div
                                                onClick={(e) => removeRecentSearch(e, term)}
                                                className="p-0.5 rounded-full hover:bg-gray-200"
                                            >
                                                <IoMdClose className="text-[10px]" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Empty State / No Suggestions Found when typing */}
                        {searchQuery.trim() && suggestions.length === 0 && !suggestionLoading && (
                            <div className="pt-10 text-center">
                                <p className="text-sm text-[#8D8D8D] italic">No suggestions for '{searchQuery}'</p>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. RESULTS MODE CONTENT (Product Grid) */}
                {/* Show if NOT Entry Mode OR Desktop (Desktop always shows results + sidebar) */}
                {(!showEntryMode || window.innerWidth > 768) && (
                    <>
                        <div className="hidden lg:block w-72 flex-shrink-0">
                            <FilterSidebar />
                        </div>
                        <div className="flex-1">
                            {/* Desktop Header ... (Hidden on mobile) */}
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
                                    <p className="text-[#8D8D8D] max-w-sm mx-auto mb-8">We couldn{"'"}t find matches for your search. Try checking your spelling or using different keywords.</p>
                                    <button
                                        onClick={() => window.location.href = '/'}
                                        className="bg-[#2D2D2D] text-white px-8 py-3 rounded-xl font-bold hover:bg-black transition-all"
                                    >
                                        Browse All Products
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
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
