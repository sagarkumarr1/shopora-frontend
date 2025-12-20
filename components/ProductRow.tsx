'use client';

import { useRouter } from 'next/navigation';
import ProductCard from './ProductCard';

interface ProductRowProps {
    title: string;
    products: any[];
}

export default function ProductRow({ title, products }: ProductRowProps) {
    const router = useRouter();

    return (
        <div className="my-8 md:my-12">
            <div className="flex justify-between items-end mb-6 px-2">
                <h2 className="text-2xl md:text-3xl text-[#2D2D2D] font-serif">{title}</h2>
                <button
                    onClick={() => router.push('/search')}
                    className="text-[#8D8D8D] hover:text-[#C08C6C] text-sm font-bold uppercase tracking-wider transition-colors border-b border-transparent hover:border-[#C08C6C] pb-0.5"
                >
                    View Collection
                </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-x-4 gap-y-8 md:gap-8 px-2 md:px-0">
                {products.map((product, index) => (
                    <ProductCard key={product._id || product.id || index} product={product} />
                ))}
            </div>
        </div>
    );
}
