'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import FilterSidebar from '@/components/FilterSidebar';
import ProductCard from '@/components/ProductCard';
import { IoIosArrowDown, IoMdSearch } from "react-icons/io";
import productService from '@/services/productService';

function SearchContent() {
    const searchParams = useSearchParams();

    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('relevance');

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
        <div className="max-w-[1600px] mx-auto p-4 md:p-6 pt-24 md:pt-32 flex flex-col lg:flex-row gap-8">

            {/* Sidebar (Desktop) */}
            <div className="hidden lg:block w-72 flex-shrink-0">
                <FilterSidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1">
                {/* Header & Sort */}
                <div className="bg-white p-6 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8] rounded-[2rem] mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <span className="font-serif text-[#2D2D2D] text-lg">Showing <span className="font-bold text-[#C08C6C]">{products.length}</span> results</span>

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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
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
    );
}

export default function SearchPage() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-12 font-sans">
            <Navbar />
            <Suspense fallback={<div className="pt-32 text-center text-[#C08C6C]">Loading...</div>}>
                <SearchContent />
            </Suspense>
        </main>
    );
}
