import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import axios from '@/services/axiosInstance';

export default function CategoryBar() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const { data } = await axios.get('categories');
                setCategories(data.data);
            } catch (error) {
                console.error("Failed to fetch categories");
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    if (loading) return null; // Cleaner loading state

    if (categories.length === 0) return null;

    return (
        <div className="py-2">
            <div className="flex gap-4 md:gap-8 overflow-x-auto scrollbar-hide px-2">
                {categories.map((cat: any) => (
                    <div
                        key={cat._id}
                        onClick={() => router.push(`/search?category=${encodeURIComponent(cat.name)}`)}
                        className="flex flex-col items-center gap-3 cursor-pointer group min-w-[70px] md:min-w-[90px]"
                    >
                        <div className="w-16 h-16 md:w-20 md:h-20 rounded-[1.25rem] overflow-hidden shadow-lg shadow-[#C08C6C]/10 group-hover:shadow-[#C08C6C]/20 transition-all duration-300 relative border border-[#E5E0D8] group-hover:border-[#C08C6C]">
                            <img
                                src={cat.image && cat.image !== 'no-photo.jpg' ? cat.image : "https://via.placeholder.com/100?text=Cat"}
                                alt={cat.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-[#C08C6C]/10 transition-colors"></div>
                        </div>
                        <span className="text-xs md:text-sm font-bold text-[#8D8D8D] group-hover:text-[#2D2D2D] transition-colors uppercase tracking-wider text-center">{cat.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
