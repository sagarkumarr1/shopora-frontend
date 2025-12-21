'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaStar } from 'react-icons/fa';
import productService from '@/services/productService';

export default function FilterSidebar() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [priceRange, setPriceRange] = useState<number>(100000);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [minRating, setMinRating] = useState<number>(0);
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await productService.getCategories();
                // Handle both array of strings or objects
                setAvailableCategories(res.data || res || []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            }
        };
        fetchCategories();
    }, []);

    useEffect(() => {
        const price = searchParams.get('maxPrice');
        if (price) setPriceRange(Number(price));

        const cats = searchParams.get('category');
        if (cats) setSelectedCategories(cats.split(','));

        const rating = searchParams.get('rating');
        if (rating) setMinRating(Number(rating));
    }, [searchParams]);

    const updateFilters = (newParams: any) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.keys(newParams).forEach(key => {
            if (newParams[key] !== null && newParams[key] !== undefined && newParams[key] !== '') {
                params.set(key, newParams[key]);
            } else {
                params.delete(key);
            }
        });
        // Reset page on filter change
        params.set('page', '1');
        router.push(`/search?${params.toString()}`);
    };

    const handleCategoryChange = (category: string) => {
        const updatedCategories = selectedCategories.includes(category)
            ? selectedCategories.filter(c => c !== category)
            : [...selectedCategories, category];

        setSelectedCategories(updatedCategories);
        updateFilters({ category: updatedCategories.join(',') });
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 h-fit w-full lg:w-64 flex-shrink-0">
            <h3 className="font-bold text-lg mb-4 text-gray-800 border-b pb-2">Filters</h3>

            {/* Price Filter */}
            <div className="mb-6">
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Price Range</h4>
                <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange}
                    onChange={(e) => {
                        setPriceRange(Number(e.target.value));
                    }}
                    onMouseUp={() => updateFilters({ maxPrice: priceRange })}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>₹0</span>
                    <span>₹{priceRange.toLocaleString('en-IN')}+</span>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-6">
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Categories</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {availableCategories.length > 0 ? availableCategories.map((cat: any) => {
                        const catName = typeof cat === 'string' ? cat : cat.name;
                        const catId = typeof cat === 'string' ? cat : (cat.slug || cat.name); // search usually by slug/name
                        return (
                            <label key={catId} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(catName)}
                                    onChange={() => handleCategoryChange(catName)}
                                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-600 capitalize">{catName}</span>
                            </label>
                        );
                    }) : (
                        <p className="text-xs text-gray-400">Loading categories...</p>
                    )}
                </div>
            </div>

            {/* Ratings */}
            <div className="mb-6">
                <h4 className="font-semibold text-sm mb-2 text-gray-700">Customer Ratings</h4>
                <div className="space-y-1">
                    {[4, 3, 2, 1].map((star) => (
                        <div
                            key={star}
                            onClick={() => {
                                setMinRating(star);
                                updateFilters({ rating: star });
                            }}
                            className={`flex items-center cursor-pointer p-1 rounded hover:bg-gray-50 ${minRating === star ? 'bg-blue-50' : ''}`}
                        >
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <FaStar key={i} className={i < star ? "text-yellow-400" : "text-gray-300"} />
                                ))}
                                <span className="ml-1">& Up</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button
                onClick={() => {
                    setPriceRange(100000);
                    setSelectedCategories([]);
                    setMinRating(0);
                    router.push('/search');
                }}
                className="w-full text-blue-600 text-sm font-semibold hover:underline mt-2"
            >
                Clear All Filters
            </button>
        </div>
    );
}
