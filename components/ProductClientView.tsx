'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { FaHeart, FaStar, FaShoppingCart, FaBolt, FaTruck, FaUndo, FaMoneyBillWave, FaRegHeart, FaCheckCircle } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { addItem, setCheckoutItems } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AppDispatch } from '@/store/store';
import Image from 'next/image';
import productService from '@/services/productService';
import Link from 'next/link';
import Skeleton from './Skeleton';
import ProductImageGallery from './ProductImageGallery';

// ... (imports remain)

export default function ProductClientView({ product }: { product: any }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();

    const [activeImage, setActiveImage] = useState(product?.image);
    const [activeTab, setActiveTab] = useState('description');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState('');

    // Variant State
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [availableVariants, setAvailableVariants] = useState<any[]>([]);

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            setAvailableVariants(product.variants);

            // Auto-select first variant's attributes
            const firstVariant = product.variants[0];
            if (firstVariant && firstVariant.attributes) {
                // Convert Map to Object if needed (Mongoose Map becomes object in JSON usually)
                const attrs = firstVariant.attributes;
                setSelectedAttributes(attrs);

                // Set initial image from variant
                if (firstVariant.images && firstVariant.images.length > 0) {
                    setActiveImage(firstVariant.images[0]);
                }
            }
        }
    }, [product]);

    // Derived State for Current Selection
    const currentVariant = availableVariants.find(v => {
        const vAttrs = v.attributes || {};
        // Check if all selected keys match this variant
        return Object.keys(selectedAttributes).every(key => vAttrs[key] === selectedAttributes[key]);
    });

    // Display Values (Variant > Product Default)
    const displayPrice = currentVariant ? currentVariant.price : product?.price;
    const displayStock = currentVariant ? currentVariant.stock : product?.stock;
    const isOutOfStock = displayStock <= 0;

    // Get all unique keys from all variants (e.g. ["Color", "Size"])
    const variantKeys = Array.from(new Set(availableVariants.flatMap(v => Object.keys(v.attributes || {}))));

    useEffect(() => {
        if (product && !product.variants?.length && product.image) {
            // Fallback for non-variant products
            const initialImg = (product.images && product.images.length > 0) ? product.images[0] : product.image;
            setActiveImage(initialImg);
        }
    }, [product]);

    // Update image when variant changes
    useEffect(() => {
        if (currentVariant && currentVariant.images && currentVariant.images.length > 0) {
            setActiveImage(currentVariant.images[0]);
        }
    }, [currentVariant]);


    const handleAttributeSelect = (key: string, value: string) => {
        setSelectedAttributes(prev => ({ ...prev, [key]: value }));
    };

    const galleryImages = (currentVariant?.images && currentVariant.images.length > 0)
        ? currentVariant.images
        : ((product?.images && product.images.length > 0) ? product.images : [product?.image].filter(Boolean));


    const handleAddToCart = async () => {
        if (product) {
            // Validation for variants
            if (availableVariants.length > 0 && !currentVariant) {
                return toast.error("Please select a valid combination of options");
            }

            if (isOutOfStock) {
                return toast.error("This item is out of stock");
            }

            try {
                await dispatch(addItem({
                    id: product._id || product.id,
                    title: product.title,
                    slug: product.slug,
                    price: displayPrice,
                    image: activeImage,
                    quantity: 1,
                    variantId: currentVariant?._id || currentVariant?.sku, // Use SKU or generated ID if configured
                    variantAttributes: selectedAttributes
                })).unwrap();
                toast.success("Added to cart!");
            } catch (err: any) {
                toast.error(typeof err === 'string' ? err : "Failed to add to cart");
            }
        }
    };

    const handleBuyNow = () => {
        if (product) {
            if (availableVariants.length > 0 && !currentVariant) {
                return toast.error("Please select a valid combination");
            }
            if (isOutOfStock) return toast.error("Out of stock");

            dispatch(setCheckoutItems([{
                id: product._id || product.id,
                title: product.title,
                price: displayPrice,
                image: activeImage,
                quantity: 1,
                variantId: currentVariant?._id || currentVariant?.sku,
                variantAttributes: selectedAttributes
            }]));
            router.push('/checkout');
        }
    };

    const handleSubmitReview = async () => {
        if (rating === 0) return toast.error("Please select a rating");
        if (!comment) return toast.error("Please write a comment");

        try {
            await productService.createReview(product._id || product.id, {
                rating,
                comment,
                images: image ? [image] : []
            });
            toast.success("Review submitted!");
            setRating(0);
            setComment('');
            setImage('');
            router.refresh();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to submit review");
        }
    };

    if (!product) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C08C6C]"></div>
            </div>
        );
    }

    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-12 font-sans">
            <Navbar />

            {/* Main Content Centered */}
            <div className="pt-24 md:pt-32 max-w-7xl mx-auto px-4 lg:px-6 flex items-center justify-center min-h-[80vh]">

                {/* The "Card" Container */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#C08C6C]/10 w-full overflow-hidden grid grid-cols-1 md:grid-cols-2 relative border border-[#E5E0D8]">

                    {/* Left: Image Gallery Section */}
                    <div className="p-4 md:p-8 bg-white">
                        <ProductImageGallery
                            images={galleryImages}
                            activeImage={activeImage}
                            onImageSelect={setActiveImage}
                            title={product.title}
                        />
                    </div>

                    {/* Right: Details Section */}
                    <div className="p-8 md:p-12 flex flex-col h-full bg-white">
                        <div className="mb-auto">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="font-serif text-3xl md:text-5xl text-[#2D2D2D] mb-3 leading-[1.1] font-medium">
                                        {product.title}
                                    </h1>
                                    <div className="flex items-center gap-3 mb-6">
                                        <span className="text-2xl md:text-3xl font-bold text-[#2D2D2D]">₹{displayPrice?.toLocaleString('en-IN')}</span>
                                        <div className="flex items-center gap-1 text-[#C08C6C] text-sm md:text-base border-l border-[#E5E0D8] pl-3 ml-1">
                                            <FaStar />
                                            <span className="font-medium text-[#5D5D5D] ml-1">{product.rating || 4.5}</span>
                                            <span className="text-[#8D8D8D] font-normal ml-1">({product.numReviews || 0} reviews)</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stock Status */}
                            {displayStock < 10 && displayStock > 0 && (
                                <p className="text-red-500 text-sm font-bold mb-4">Only {displayStock} left!</p>
                            )}
                            {isOutOfStock && (
                                <p className="text-red-600 font-bold text-lg mb-4">Out of Stock</p>
                            )}

                            {/* Dynamic Variants Selection using Chips */}
                            {variantKeys.length > 0 && (
                                <div className="space-y-4 mb-6">
                                    {variantKeys.map(key => {
                                        // Get unique values for this key
                                        const uniqueValues = Array.from(new Set(availableVariants.map(v => v.attributes[key])));

                                        return (
                                            <div key={key}>
                                                <span className="text-sm font-bold text-[#8D8D8D] uppercase tracking-wider mb-2 block">{key}</span>
                                                <div className="flex gap-2 flex-wrap">
                                                    {uniqueValues.map((val: any) => {
                                                        const isSelected = selectedAttributes[key] === val;
                                                        return (
                                                            <button
                                                                key={val}
                                                                onClick={() => handleAttributeSelect(key, val)}
                                                                className={`
                                                                    px-4 py-2 rounded-lg text-sm font-medium border transition-all
                                                                    ${isSelected
                                                                        ? 'border-[#C08C6C] bg-[#C08C6C] text-white shadow-md'
                                                                        : 'border-gray-200 text-gray-600 hover:border-[#C08C6C] hover:text-[#C08C6C]'
                                                                    }
                                                                `}
                                                            >
                                                                {val}
                                                            </button>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Color / Variant Mockups (Legacy support for 'colors' array if no variants) */}
                            {(!product.variants || product.variants.length === 0) && product.colors && product.colors.length > 0 && (
                                <div className="mb-6">
                                    <span className="text-sm font-bold text-[#8D8D8D] uppercase tracking-wider mb-2 block">Available Colors</span>
                                    <div className="flex gap-3 flex-wrap">
                                        {product.colors.map((color: string, idx: number) => (
                                            <div
                                                key={idx}
                                                className="w-8 h-8 rounded-full cursor-pointer ring-1 ring-offset-2 ring-stone-300 hover:ring-[#C08C6C] transition-all shadow-sm border border-stone-200"
                                                style={{ backgroundColor: color }}
                                                title={color}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Short Description */}
                            <p className="text-[#5D5D5D] leading-relaxed mb-8 text-base">
                                {product.description?.substring(0, 150)}... Crafted from premium materials, this item is a timeless addition to your collection. Perfect for everyday elegance.
                            </p>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <button
                                    disabled={isOutOfStock}
                                    onClick={handleAddToCart}
                                    className={`flex-1 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-[#C08C6C]/20 transition-all transform hover:-translate-y-1 active:translate-y-0
                                        ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#C08C6C] hover:bg-[#A06C4C]'}`}
                                >
                                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <button
                                    disabled={isOutOfStock}
                                    onClick={handleBuyNow}
                                    className={`flex-1 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-xl shadow-[#2D2D2D]/20 transition-all transform hover:-translate-y-1 active:translate-y-0
                                         ${isOutOfStock ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2D2D2D] hover:bg-black'}`}
                                >
                                    Buy Now
                                </button>
                            </div>

                            {/* Tabs - Restored to Right Column */}
                            <div className="mb-8">
                                <div className="flex gap-6 border-b border-[#E5E0D8] mb-4">
                                    <button
                                        onClick={() => setActiveTab('description')}
                                        className={`pb-2 text-sm font-bold tracking-wide uppercase transition-colors relative ${activeTab === 'description' ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}
                                    >
                                        Description
                                        {activeTab === 'description' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C08C6C]"></span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('details')}
                                        className={`pb-2 text-sm font-bold tracking-wide uppercase transition-colors relative ${activeTab === 'details' ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}
                                    >
                                        Details
                                        {activeTab === 'details' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C08C6C]"></span>}
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('reviews')}
                                        className={`pb-2 text-sm font-bold tracking-wide uppercase transition-colors relative ${activeTab === 'reviews' ? 'text-[#C08C6C]' : 'text-[#8D8D8D] hover:text-[#2D2D2D]'}`}
                                    >
                                        Reviews
                                        {activeTab === 'reviews' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#C08C6C]"></span>}
                                    </button>
                                </div>

                                <div className="text-[#5D5D5D] min-h-[100px] text-sm leading-relaxed">
                                    {activeTab === 'description' && (
                                        <p>{product.description}</p>
                                    )}
                                    {activeTab === 'details' && (
                                        <ul className="space-y-2">
                                            {/* Show Attributes Here Too */}
                                            {variantKeys.length > 0 && selectedAttributes && (
                                                <div className="mb-4 pb-4 border-b border-gray-100">
                                                    {Object.entries(selectedAttributes).map(([k, v]) => (
                                                        <li key={k} className="flex"><span className="font-bold w-24 text-[#2D2D2D]">{k}:</span> {v}</li>
                                                    ))}
                                                </div>
                                            )}
                                            {Object.entries(product.specs || { 'Material': 'Premium', 'Origin': 'Imported' }).map(([key, value]: any) => (
                                                <li key={key} className="flex"><span className="font-bold w-24 text-[#2D2D2D]">{key}:</span> {value}</li>
                                            ))}
                                        </ul>
                                    )}
                                    {activeTab === 'reviews' && (
                                        <div className="max-h-[400px] overflow-y-auto pr-2 scrollbar-thin">
                                            {product.reviews && product.reviews.length > 0 ? (
                                                <div className="space-y-4 mb-6">
                                                    {product.reviews.map((r: any, i: number) => (
                                                        <div key={i} className="border-b border-[#F0F0E0] pb-3 last:border-0">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-[#2D2D2D] block">{r.name}</span>
                                                                        <span className="flex items-center gap-1 text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider border border-green-100">
                                                                            <FaCheckCircle className="text-[10px]" /> Verified
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex text-[#C08C6C] text-xs mt-1">
                                                                        {[...Array(5)].map((_, s) => (
                                                                            <FaStar key={s} className={s < r.rating ? "" : "text-[#E5E0D8]"} />
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                                <span className="text-[10px] text-[#8D8D8D]">{new Date(r.createdAt || Date.now()).toLocaleDateString()}</span>
                                                            </div>
                                                            <p className="text-xs text-[#5D5D5D] italic">"{r.comment}"</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-4 text-center mb-6">
                                                    <p className="text-[#8D8D8D] mb-2">No reviews yet.</p>
                                                </div>
                                            )}

                                            {/* Write a Review Section */}
                                            <div className="bg-[#F9F9F5] p-4 rounded-xl border border-[#E5E0D8]">
                                                <h4 className="font-bold text-[#2D2D2D] text-sm mb-3">Write a Review</h4>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-[#8D8D8D]">Rating:</span>
                                                        <div className="flex gap-1">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => setRating(star)}
                                                                    className={`text-lg transition-transform hover:scale-110 ${rating >= star ? 'text-[#C08C6C]' : 'text-[#E5E0D8] hover:text-[#C08C6C]/50'}`}
                                                                >
                                                                    <FaStar />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        value={comment}
                                                        onChange={(e) => setComment(e.target.value)}
                                                        className="w-full bg-white border border-[#E5E0D8] rounded-lg p-3 text-xs outline-none focus:border-[#C08C6C] transition-colors h-20 resize-none text-[#2D2D2D]"
                                                        placeholder="Share your experience..."
                                                    ></textarea>
                                                    <button
                                                        onClick={handleSubmitReview}
                                                        className="w-full bg-[#2D2D2D] text-white font-bold py-2 rounded-lg shadow-md hover:bg-black transition-all text-xs uppercase tracking-wide"
                                                    >
                                                        Submit
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 pt-6 border-t border-[#E5E0D8] mt-auto">
                                <div className="flex flex-col items-center text-center gap-2 text-[#8D8D8D]">
                                    <FaTruck className="text-[#C08C6C] text-xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">
                                        Get it by {new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 text-[#8D8D8D]">
                                    <FaUndo className="text-[#C08C6C] text-xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Easy Returns</span>
                                </div>
                                <div className="flex flex-col items-center text-center gap-2 text-[#8D8D8D]">
                                    <FaMoneyBillWave className="text-[#C08C6C] text-xl" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">COD Available</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> {/* Closes Main Wrapper */}
            {/* Mobile Fixed CTA Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#E5E0D8] p-4 flex gap-3 z-40 pb-[calc(1rem+64px)]">
                <button
                    disabled={isOutOfStock}
                    onClick={handleAddToCart}
                    className={`flex-1 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all
                        ${isOutOfStock ? 'bg-gray-400' : 'bg-[#C08C6C]'}`}
                >
                    {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </button>
                <button
                    disabled={isOutOfStock}
                    onClick={handleBuyNow}
                    className={`flex-1 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all
                        ${isOutOfStock ? 'bg-gray-400' : 'bg-[#2D2D2D]'}`}
                >
                    Buy Now
                </button>
            </div>
        </main >
    );
}
