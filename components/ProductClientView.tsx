'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { FaHeart, FaStar, FaShoppingCart, FaBolt, FaTruck, FaUndo, FaMoneyBillWave, FaRegHeart, FaCheckCircle, FaChevronRight, FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, setCheckoutItems } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '@/store/store';
import Image from 'next/image';
import productService from '@/services/productService';
import Link from 'next/link';
import Skeleton from './Skeleton';
import ProductImageGallery from './ProductImageGallery';

// ... (imports remain)

export default function ProductClientView({ product }: { product: any }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);

    const [activeImage, setActiveImage] = useState(product?.image);
    const [activeTab, setActiveTab] = useState('description');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState('');
    const [quantity, setQuantity] = useState(1);

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
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to submit review");
        }
    };

    const [isWishlisted, setIsWishlisted] = useState(false);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C08C6C]"></div>
            </div>
        );
    }

    // Calculate Discount Percentage
    const discount = product.originalPrice ? Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100) : 0;

    return (
        <main className="min-h-screen bg-[#FDFBF7] font-sans text-[#2D2D2D] pb-32 md:pb-12">
            {/* Desktop Navbar */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* MOBILE VIEW (MD:HIDDEN) */}
            <div className="md:hidden">
                {/* Header (Absolute - scrolls with page) */}
                <div className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center bg-transparent pointer-events-none">
                    {/* Back Button */}
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#2D2D2D] pointer-events-auto transition-transform active:scale-95">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
                    </button>

                    {/* Right Icons: Search, Cart, Wishlist */}
                    <div className="flex items-center gap-3 pointer-events-auto">
                        {/* Search */}
                        <Link href="/search" className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#2D2D2D] transition-transform active:scale-95">
                            <FaSearch className="text-lg" />
                        </Link>

                        {/* Cart */}
                        <Link href="/cart" className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#2D2D2D] relative transition-transform active:scale-95">
                            <FaShoppingCart className="text-lg" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold w-5 h-5 border-2 border-white rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {/* Wishlist */}
                        <button onClick={() => setIsWishlisted(!isWishlisted)} className="w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-[#2D2D2D] transition-transform active:scale-95">
                            {isWishlisted ? <FaHeart className="text-[#C08C6C] text-xl" /> : <FaRegHeart className="text-xl" />}
                        </button>
                    </div>
                </div>

                {/* Main Product Image */}
                <div className="relative w-full aspect-[4/5] bg-[#F0EBE6]">
                    <Image
                        src={activeImage || '/placeholder.png'}
                        alt={product.title}
                        fill
                        className="object-cover"
                        priority
                    />

                    {/* Thumbnails Overlay (Bottom Left) */}
                    <div className="absolute bottom-4 left-4 flex gap-2">
                        {galleryImages.slice(0, 3).map((img: string, idx: number) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImage(img)}
                                className={`w-12 h-16 rounded-md overflow-hidden border-2 transition-all ${activeImage === img ? 'border-[#C08C6C]' : 'border-white/50'}`}
                            >
                                <img src={img} alt="thumb" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                    {/* Pagination Dots (Bottom Center) - Decorative based on mockup */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {galleryImages.map((_: any, i: number) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${activeImage === galleryImages[i] ? 'bg-white' : 'bg-white/50'}`} />
                        ))}
                    </div>
                </div>

                {/* Content Body */}
                <div className="px-5 pt-6 sticky top-[80vh] bg-[#FDFBF7] rounded-t-[2rem] -mt-6 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10 min-h-[50vh]">
                    {/* Title & Reviews */}
                    <div className="mb-2">
                        <h1 className="font-serif text-2xl font-medium text-[#2D2D2D] mb-1">{product.title}</h1>
                        <div className="flex items-center gap-2 text-xs text-[#8D8D8D]">
                            <div className="flex text-[#C08C6C]">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < (product.rating || 4) ? "" : "text-[#E5E0D8]"} />
                                ))}
                            </div>
                            <span className="font-bold text-[#2D2D2D]">{product.rating || 4.5}</span>
                            <span>| {product.numReviews || 120} reviews</span>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-6">
                        <span className="text-2xl font-bold text-[#2D2D2D]">₹{displayPrice?.toLocaleString('en-IN')}</span>
                        {product.originalPrice && product.originalPrice > displayPrice && (
                            <>
                                <span className="text-lg text-[#ccc] line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                                <span className="bg-[#C08C6C] text-white text-[10px] font-bold px-1.5 py-0.5 rounded ml-1">
                                    {Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}% off
                                </span>
                            </>
                        )}
                        <span className="text-[10px] text-[#8D8D8D] block w-full mt-0.5">inclusive of all taxes</span>
                    </div>

                    {/* Selectors */}
                    {/* Dynamic Variants Selection (Mobile) */}
                    {variantKeys.length > 0 && (
                        <div className="space-y-4 mb-6">
                            {variantKeys.map(key => {
                                // Get unique values for this key
                                const uniqueValues = Array.from(new Set(availableVariants.map(v => v.attributes[key])));

                                return (
                                    <div key={key}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-bold text-[#2D2D2D] capitalize">{key}</span>
                                        </div>
                                        <div className="flex gap-3 flex-wrap">
                                            {uniqueValues.map((val: any) => {
                                                const isSelected = selectedAttributes[key] === val;
                                                return (
                                                    <button
                                                        key={val}
                                                        onClick={() => handleAttributeSelect(key, val)}
                                                        className={`min-w-[40px] px-3 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${isSelected ? 'bg-[#ae856b] text-white' : 'bg-[#F2F0EB] text-[#5D5D5D]'}`}
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

                    {/* Quantity & Add to Cart */}
                    <div className="flex gap-4 mb-8">
                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-white border border-[#E5E0D8] rounded-xl px-2 h-12 shadow-sm">
                            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-8 h-full text-[#2D2D2D] flex items-center justify-center text-lg">-</button>
                            <span className="w-6 text-center font-bold text-[#2D2D2D]">{quantity}</span>
                            <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-full text-[#2D2D2D] flex items-center justify-center text-lg">+</button>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className={`flex-1 flex items-center justify-center gap-2 bg-[#C08C6C] text-white font-bold rounded-xl h-12 shadow-lg shadow-[#C08C6C]/20 active:scale-95 transition-transform ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        >
                            <FaShoppingCart className="text-sm" />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>

                    {/* Description Preview */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-[#2D2D2D]">Description</h3>
                            <button onClick={() => setActiveTab('description')} className="text-xs text-[#8D8D8D] hover:text-[#C08C6C]">View All &gt;</button>
                        </div>
                        <p className="text-xs text-[#5D5D5D] leading-relaxed line-clamp-3">
                            {product.description || "Upgrade your wardrobe with this premium item. Perfect for formal and semi-formal occasions. Made from high-quality materials for lasting comfort and style."}
                        </p>
                    </div>

                    {/* Rate & Review */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-sm font-bold text-[#2D2D2D]">Rate & Review</h3>
                            <span className="text-[10px] text-[#8D8D8D]">22 weeks ago</span>
                        </div>
                        {/* Stars Input */}
                        <div className="flex gap-2 mb-3">
                            {[1, 2, 3, 4, 5].map(s => (
                                <button key={s} onClick={() => setRating(s)} className={`text-xl ${rating >= s ? 'text-[#C08C6C]' : 'text-[#E5E0D8]'}`}>
                                    <FaStar />
                                </button>
                            ))}
                        </div>
                        {/* Input Box */}
                        <div className="relative">
                            <input
                                type="text"
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Write your review..."
                                className="w-full bg-[#f9f9f9] border border-[#f0f0f0] rounded-xl px-4 py-3 text-xs outline-none focus:border-[#C08C6C] transition-colors"
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <button className="text-[#ae856b] bg-[#ae856b]/10 p-2 rounded-lg">
                                {/* Icon placeholder for image upload if needed */}
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"> <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" /> <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z" /> </svg>
                            </button>
                            <button onClick={handleSubmitReview} className="bg-[#ae856b] text-white text-xs font-bold px-6 py-2 rounded-lg shadow-md">
                                Submit Review
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* DESKTOP VIEW (HIDDEN MD:BLOCK) - Keeping original layout logic wrapped */}
            <div className="hidden md:flex pt-32 max-w-7xl mx-auto px-6 items-start justify-center min-h-[80vh]">
                {/* ... Existing Desktop Layout duplicated or kept as is ... */}
                {/* Re-implementing the desktop layout here to ensure logic continuity within the component return */}
                <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-[#C08C6C]/10 w-full overflow-hidden grid grid-cols-2 border border-[#E5E0D8]">
                    {/* Desktop Image Gallery */}
                    <div className="bg-white p-8">
                        <ProductImageGallery
                            images={galleryImages}
                            activeImage={activeImage}
                            onImageSelect={setActiveImage}
                            title={product.title}
                        />
                    </div>

                    {/* Desktop Details */}
                    <div className="p-12 flex flex-col h-full bg-white">
                        {/* Title */}
                        <h1 className="font-serif text-5xl text-[#2D2D2D] mb-2 leading-tight font-medium">{product.title}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-4">
                            <div className="flex text-[#C08C6C] text-xs">
                                {[...Array(5)].map((_, i) => (
                                    <FaStar key={i} className={i < (product.rating || 4) ? "" : "text-[#E5E0D8]"} />
                                ))}
                            </div>
                            <span className="text-xs font-bold text-[#2D2D2D]">{product.rating || 4.5}</span>
                            <span className="text-xs text-[#8D8D8D]">| {product.numReviews || 120} reviews</span>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-3xl font-bold text-[#2D2D2D]">₹{displayPrice?.toLocaleString('en-IN')}</span>
                            {product.originalPrice && (
                                <span className="text-lg text-[#8D8D8D] line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                            )}
                        </div>

                        {/* Desktop Selectors - Reuse Logic */}
                        {variantKeys.length > 0 && (
                            <div className="space-y-4 mb-6">
                                {variantKeys.map(key => (
                                    <div key={key}>
                                        <span className="text-sm font-bold text-[#8D8D8D] uppercase mb-2 block">{key}</span>
                                        <div className="flex gap-2">
                                            {Array.from(new Set(availableVariants.map(v => v.attributes[key]))).map((val: any) => (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAttributeSelect(key, val)}
                                                    className={`px-4 py-2 rounded-lg text-sm border transition-all ${selectedAttributes[key] === val ? 'bg-[#C08C6C] text-white' : 'border-gray-200'}`}
                                                >
                                                    {val}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Desktop Buttons */}
                        <div className="flex gap-4 mb-8">
                            <button onClick={handleAddToCart} className="flex-1 bg-[#C08C6C] text-white py-4 rounded-2xl font-bold hover:bg-[#A06C4C] transition-all">
                                Add to Cart
                            </button>
                            <button onClick={handleBuyNow} className="flex-1 bg-[#2D2D2D] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
                                Buy Now
                            </button>
                        </div>

                        {/* Description */}
                        <p className="text-[#5D5D5D] leading-relaxed mb-8">{product.description}</p>
                    </div>
                </div>
            </div>
        </main >
    );
}
