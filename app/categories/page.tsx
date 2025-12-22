'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import categoryService from '@/services/categoryService';
import { useRouter } from 'next/navigation';
import { IoArrowBack } from 'react-icons/io5';

export default function CategoriesPage() {
    const router = useRouter();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await categoryService.getCategories();
                if (res.success) {
                    setCategories(res.data);
                }
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategories();
    }, []);

    if (loading) {
        return (
            <main className="bg-[#FDFBF7] min-h-screen">
                <Navbar />
                <div className="pt-24 flex justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C08C6C]"></div>
                </div>
            </main>
        );
    }

    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-24">
            {/* Header */}
            <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E0D8] px-4 py-3 flex items-center gap-4">
                <button onClick={() => router.back()} className="text-[#2D2D2D] p-1">
                    <IoArrowBack className="text-xl" />
                </button>
                <h1 className="font-serif text-xl text-[#2D2D2D] font-medium">All Categories</h1>
            </div>

            <div className="pt-20 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {categories.map((cat, i) => (
                        <Link
                            href={`/search?category=${encodeURIComponent(cat.name)}`}
                            key={cat._id || i}
                            className="bg-white rounded-2xl p-4 flex flex-col items-center gap-3 shadow-sm border border-[#E5E0D8] active:scale-95 transition-transform"
                        >
                            <div className="w-20 h-20 rounded-full bg-[#F5F1EB] flex items-center justify-center overflow-hidden">
                                {cat.image && cat.image.startsWith('http') ? (
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                ) : (
                                    <img src="https://cdn-icons-png.flaticon.com/128/706/706614.png" alt={cat.name} className="w-10 h-10 opacity-50" />
                                )}
                            </div>
                            <span className="text-sm font-medium text-[#2D2D2D] capitalize text-center leading-tight">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </main>
    )
}
