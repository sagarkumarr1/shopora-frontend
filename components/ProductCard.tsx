'use client';

import { useDispatch } from 'react-redux';
import { addItem } from '@/store/cartSlice';
import { FaHeart, FaStar, FaShoppingCart } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/store/store';

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
    showAddToCart?: boolean;
}

export default function ProductCard({ product }: { product: ProductProps }) {
    const dispatch = useDispatch<AppDispatch>();
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

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const cartId = product._id || product.id;
        if (!cartId) {
            toast.error("Product unavailable");
            return;
        }

        dispatch(addItem({
            id: cartId,
            title: product.title,
            price: product.price,
            image: product.image || (product.images && product.images[0]) || '/placeholder.png',
            quantity: 1,
            variantId: typeof cartId === 'string' ? cartId : cartId.toString(),
            variantAttributes: {}
        }));
        toast.success("Added to cart!");
    };

    return (
        <Link href={`/product/${productId}`} className="group flex flex-col gap-3 cursor-pointer h-full">
            {/* Image Container */}
            <div className="relative w-full aspect-[4/5] bg-[#F0EBE6] rounded-[1.5rem] overflow-hidden">
                <Image
                    src={product.image || (product.images && product.images[0]) || '/placeholder.png'}
                    alt={product.title || 'Product'}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                />

                {/* Wishlist Button (Top Right) */}
                <div className="absolute top-3 right-3">
                    <button className="bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-sm text-[#5D5D5D] hover:text-[#C08C6C] transition-colors relative z-10">
                        <FaHeart className="text-sm" />
                    </button>
                    {/* Shadow/Overlay click fix */}
                </div>
            </div>

            {/* Content Container */}
            <div className="flex flex-col gap-1 px-1 flex-1">
                <h3 className="font-serif text-[#2D2D2D] text-lg leading-tight font-medium line-clamp-1 group-hover:text-[#C08C6C] transition-colors">
                    {product.title}
                </h3>

                <div className="flex items-center justify-between mt-1">
                    <div className="flex flex-col leading-none">
                        <span className="text-xl font-bold text-[#2D2D2D] tracking-tight">₹{formatPrice(product.price)}</span>
                        {displayOriginalPrice && (
                            <span className="text-xs text-[#8D8D8D] line-through mt-0.5">₹{formatPrice(displayOriginalPrice)}</span>
                        )}
                    </div>

                    {product.discount && (
                        <div className="bg-[#C08C6C] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {product.discount} OFF
                        </div>
                    )}
                </div>

                {/* Add to Cart Button (Conditional) */}
                {product.showAddToCart && (
                    <button
                        onClick={handleAddToCart}
                        className="mt-3 w-full py-2.5 border border-[#E5E0D8] rounded-xl text-[#5D5D5D] text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#F9F9F5] hover:text-[#C08C6C] hover:border-[#C08C6C] transition-all"
                    >
                        <FaShoppingCart className="text-xs" /> Add to Cart
                    </button>
                )}
            </div>
        </Link>
    );
}
