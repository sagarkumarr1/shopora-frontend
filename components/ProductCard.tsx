'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FaHeart, FaStar } from 'react-icons/fa';

// Helper to parse price safely
const formatPrice = (price: number | undefined) => {
    return price ? price.toLocaleString('en-IN') : '0';
};

interface ProductProps {
    _id?: string;
    id?: string | number;
    slug?: string;
    title: string;
    price: number;
    originalPrice?: number;
    discount?: string;
    image: string;
    rating: number;
    reviews: any; // Can be number or array of objects
    images?: string[]; // Add images array to interface
}

export default function ProductCard({ product }: { product: ProductProps }) {
    // Fallback for id, prioritizes slug for SEO
    const productId = product.slug || product._id || product.id;

    // Safety check for empty product
    if (!product) return null;

    // Calculate original price if missing (Mock logic or just hide it)
    let displayOriginalPrice = product.originalPrice;
    if (!displayOriginalPrice && product.price && product.discount) {
        // Try to parse discount "15% off"
        const disc = parseInt(product.discount);
        if (!isNaN(disc) && disc > 0) {
            displayOriginalPrice = Math.round(product.price / (1 - disc / 100));
        }
    }

    return (
        <Link href={`/product/${productId}`} className="group flex flex-col gap-3 cursor-pointer">
            <div className="relative w-full aspect-[4/5] bg-[#F5F5F0] rounded-[1.25rem] overflow-hidden mb-2">
                {/* Image */}
                <Image
                    src={product.image || (product.images && product.images[0]) || '/placeholder.png'}
                    alt={product.title || 'Product'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />

                {/* Overlay Actions */}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="bg-white p-2.5 rounded-full shadow-lg text-[#2D2D2D] hover:text-[#C08C6C] transition-colors">
                        <FaHeart className="text-sm" />
                    </button>
                </div>

                {/* Badges */}
                {product.discount && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                        <span className="text-[10px] font-bold tracking-widest uppercase text-[#2D2D2D]">{product.discount} OFF</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-1 px-1">
                {/* Title */}
                <h3 className="font-serif text-[#2D2D2D] text-lg leading-snug group-hover:text-[#C08C6C] transition-colors line-clamp-2 md:line-clamp-1 h-auto font-medium">
                    {product.title}
                </h3>

                {/* Rating - Minimal */}
                <div className="flex items-center gap-1 text-xs text-[#8D8D8D]">
                    <FaStar className="text-[#C08C6C]" />
                    <span className="font-medium text-[#5D5D5D]">{product.rating || 0}</span>
                    <span>({Array.isArray(product.reviews) ? product.reviews.length : (product.reviews || 0)})</span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-base md:text-lg font-bold text-[#2D2D2D]">₹{formatPrice(product.price)}</span>
                    {displayOriginalPrice && (
                        <span className="text-xs text-[#8D8D8D] line-through decoration-stone-300">₹{formatPrice(displayOriginalPrice)}</span>
                    )}
                </div>
            </div>
        </Link>
    );
}
