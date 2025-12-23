'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { FaHeart, FaStar, FaShoppingCart, FaBolt, FaTruck, FaUndo, FaMoneyBillWave, FaRegHeart, FaCheckCircle, FaChevronRight, FaSearch, FaEdit, FaTrash, FaTimes } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { addItem, setCheckoutItems } from '@/store/cartSlice';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '@/store/store';
import Image from 'next/image';
import productService from '@/services/productService';
import Link from 'next/link';
import authService from '@/services/authService'; // Added import
import Skeleton from './Skeleton';
import ProductImageGallery from './ProductImageGallery';
import useScrollDirection from '@/hooks/useScrollDirection';

// ... (imports remain)

export default function ProductClientView({ product }: { product: any }) {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const cartItems = useSelector((state: RootState) => state.cart.cartItems);
    const { user } = useSelector((state: RootState) => state.auth);

    const [activeImage, setActiveImage] = useState(product?.image);
    const [activeImageIndex, setActiveImageIndex] = useState(0); // New state for mobile gallery index
    const [activeTab, setActiveTab] = useState('description');
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [image, setImage] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isAddingToCart, setIsAddingToCart] = useState(false);

    // Edit Review State
    const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
    const [editComment, setEditComment] = useState('');
    const [editRating, setEditRating] = useState(0);

    const { scrollDirection, scrollY } = useScrollDirection();
    const isHideHeader = scrollDirection === 'down' && scrollY > 50;
    const showCompactHeader = scrollY > 100;

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
            // Validation for variants ONLY if variants exist
            if (availableVariants.length > 0 && !currentVariant) {
                // Try to fallback to default if just one variant exists or auto-select
                // But for now, just toast error.
                console.error("No variant selected", { availableVariants, selectedAttributes });
                return toast.error("Please select options (Size/Color)");
            }

            if (isOutOfStock) {
                return toast.error("This item is out of stock");
            }

            try {
                setIsAddingToCart(true);
                console.log("Dispatching addItem...", {
                    id: product._id || product.id,
                    title: product.title,
                    variantId: currentVariant?._id || currentVariant?.sku,
                });

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
                console.error("Add to cart failed:", err);
                toast.error(typeof err === 'string' ? err : "Failed to add to cart");
            } finally {
                setIsAddingToCart(false);
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

    const handleDeleteReview = async (reviewId: string) => {
        if (window.confirm("Are you sure you want to delete your review?")) {
            try {
                await productService.deleteReview(product._id || product.id, reviewId);
                toast.success("Review deleted");
                window.location.reload();
            } catch (error: any) {
                toast.error(error.response?.data?.error || "Failed to delete review");
            }
        }
    };

    const startEditReview = (review: any) => {
        setEditingReviewId(review._id);
        setEditComment(review.comment);
        setEditRating(review.rating);
    };

    const cancelEditReview = () => {
        setEditingReviewId(null);
        setEditComment('');
        setEditRating(0);
    };

    const handleUpdateReview = async (reviewId: string) => {
        try {
            await productService.updateReview(product._id || product.id, reviewId, {
                rating: editRating,
                comment: editComment
            });
            toast.success("Review updated");
            setEditingReviewId(null);
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to update review");
        }
    };

    const [isWishlisted, setIsWishlisted] = useState(false);

    useEffect(() => {
        if (user && user.wishlist && product) {
            const pid = product._id || product.id;
            setIsWishlisted(user.wishlist.some((item: any) => (item._id || item) === pid));
        }
    }, [user, product]);

    const handleToggleWishlist = async () => {
        if (!user) {
            toast.info("Please login to use wishlist");
            router.push('/login');
            return;
        }

        const pid = product._id || product.id;
        try {
            // Optimistic update
            setIsWishlisted(!isWishlisted);
            await authService.toggleWishlist(pid);
            // Wait, looking at imports, authService is NOT imported. product service usually doesn't have toggleWishlist. 
            // The file imports productService. Does it export toggleWishlist? 
            // Let's check imports. Lines 1-18. authService is NOT imported.
            // I need to use authService. I should allow the tool to add import or just add it here?
            // "I cannot make multiple parallel calls to this tool ... for the same file". 
            // So I must do usage + import in one go if I can, OR just use `import('@/services/authService')` dynamic if lazy.
            // But let's look at `productService` usage in line 160. 
            // I will use dynamic import for now or assume I will fix imports in next step if I fail.
            // Actually, best to add import in a separate chunk in this call.

            toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
        } catch (error) {
            setIsWishlisted(!isWishlisted); // Revert
            toast.error("Failed to update wishlist");
        }
    };
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

            {/* Mobile View Content */}
            <div className="md:hidden pb-12 bg-[#FDFBF7]">
                {/* 1. HEADER (Fixed Top) */}
                <div className={`fixed top-0 left-0 right-0 z-50 h-[3.5rem] bg-white/90 backdrop-blur-md flex justify-between items-center px-4 shadow-sm transition-transform duration-300 ${isHideHeader ? '-translate-y-full' : 'translate-y-0'}`}>
                    <span className="font-serif text-xl font-bold text-[#C08C6C] truncate max-w-[60%]">
                        {showCompactHeader ? product.title : 'ApnaShop'}
                    </span>
                    <div className="flex items-center gap-4">
                        <Link href="/search" className="text-[#2D2D2D]">
                            <FaSearch className="text-lg" />
                        </Link>
                        <Link href="/cart" className="relative text-[#2D2D2D]">
                            <FaShoppingCart className="text-lg" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-[#C08C6C] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Spacer for Fixed Header */}
                <div className="h-14"></div>

                {/* 2. PRODUCT IMAGE SECTION (Swipeable) */}
                {/* 2. PRODUCT IMAGE SECTION (Swipeable Gallery) */}
                <div className="relative w-full aspect-[4/5] bg-[#F5F1EB]">
                    {/* Scrollable Container */}
                    <div
                        className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide touch-pan-x"
                        onScroll={(e) => {
                            const scrollLeft = e.currentTarget.scrollLeft;
                            const width = e.currentTarget.offsetWidth;
                            const newIndex = Math.round(scrollLeft / width);
                            setActiveImageIndex(newIndex);
                        }}
                    >
                        {galleryImages.map((img: string, idx: number) => (
                            <div key={idx} className="min-w-full w-full h-full snap-center flex items-center justify-center relative">
                                <Image
                                    src={img || '/placeholder.png'}
                                    alt={`${product.title} - View ${idx + 1}`}
                                    fill
                                    className="object-contain p-4" // object-contain as requested
                                    priority={idx === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Dots Indicator */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                        {galleryImages.map((_: any, i: number) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${activeImageIndex === i ? 'bg-[#2D2D2D] w-4' : 'bg-[#2D2D2D]/30 w-1.5'}`}
                            />
                        ))}
                    </div>

                    {/* Discount Badge */}
                    {product.originalPrice && product.originalPrice > displayPrice && (
                        <div className="absolute top-4 left-4 bg-[#C08C6C] text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm z-10">
                            {Math.round(((product.originalPrice - displayPrice) / product.originalPrice) * 100)}% OFF
                        </div>
                    )}

                    {/* Wishlist Button (Mobile) */}
                    <button
                        onClick={handleToggleWishlist}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-[#8D8D8D] z-10 transition-transform active:scale-95"
                    >
                        {isWishlisted ? <FaHeart className="text-[#C08C6C]" /> : <FaRegHeart />}
                    </button>
                </div>

                <div className="px-4 pt-6">
                    {/* 3. PRODUCT INFO SECTION */}
                    <h1 className="font-sans text-xl font-bold text-[#2D2D2D] mb-2 leading-tight">{product.title}</h1>

                    <div className="flex items-center gap-2 mb-4">
                        <div className="bg-[#C08C6C] text-white text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-1">
                            {product.rating || 4.5} <FaStar className="text-[10px]" />
                        </div>
                        <button
                            onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="text-xs text-[#8D8D8D] underline"
                        >
                            ({product.numReviews || 120} Reviews)
                        </button>
                    </div>

                    {/* 4. PRICE SECTION */}
                    <div className="flex items-baseline gap-3 mb-6">
                        <span className="text-2xl font-bold text-[#2D2D2D]">₹{displayPrice?.toLocaleString('en-IN')}</span>
                        {product.originalPrice && product.originalPrice > displayPrice && (
                            <span className="text-sm text-[#8D8D8D] line-through">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                        )}
                    </div>

                    {/* 5. VARIANT SELECTION & QUANTITY */}
                    <div className="space-y-6 mb-8">
                        {/* Variant Logic Reuse */}
                        {variantKeys.map(key => {
                            const uniqueValues = Array.from(new Set(availableVariants.map(v => v.attributes[key])));
                            const isSize = key.toLowerCase() === 'size';
                            const isColor = key.toLowerCase() === 'color' || key.toLowerCase() === 'colour';

                            return (
                                <div key={key}>
                                    <h3 className="text-sm font-bold text-[#2D2D2D] mb-3 capitalize">{key}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {uniqueValues.map((val: any) => {
                                            const isSelected = selectedAttributes[key] === val;
                                            return (
                                                <button
                                                    key={val}
                                                    onClick={() => handleAttributeSelect(key, val)}
                                                    className={`
                                                        ${isSize
                                                            ? `w-12 h-12 rounded-lg flex items-center justify-center border font-medium text-sm transition-all ${isSelected ? 'border-[#C08C6C] bg-[#C08C6C] text-white' : 'border-[#E5E0D8] bg-white text-[#5D5D5D]'}`
                                                            : isColor
                                                                ? `w-8 h-8 rounded-full border-2 ${isSelected ? 'border-[#C08C6C] ring-2 ring-[#C08C6C]/20' : 'border-transparent'}` // Placeholder for color swatch logic
                                                                : `px-4 py-2 rounded-lg border text-sm ${isSelected ? 'border-[#C08C6C] bg-[#C08C6C] text-white' : 'border-[#E5E0D8] bg-white text-[#5D5D5D]'}`
                                                        }
                                                    `}
                                                    style={isColor ? { backgroundColor: val.toLowerCase() } : {}} // Basic color mapping
                                                >
                                                    {!isColor && val}
                                                </button>
                                            )
                                        })}
                                    </div>
                                    {isColor && <div className="text-xs text-[#8D8D8D] mt-1 capitalize">{selectedAttributes[key] || 'Select Color'}</div>}
                                </div>
                            )
                        })}

                        {/* 6. QUANTITY SELECTOR */}
                        <div>
                            <h3 className="text-sm font-bold text-[#2D2D2D] mb-3">Quantity</h3>
                            <div className="flex items-center w-max bg-white border border-[#E5E0D8] rounded-lg h-10">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-full flex items-center justify-center text-[#2D2D2D] active:bg-gray-50 rounded-l-lg">-</button>
                                <span className="w-8 text-center font-bold text-sm text-[#2D2D2D] border-x border-[#E5E0D8] h-full flex items-center justify-center">{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-full flex items-center justify-center text-[#2D2D2D] active:bg-gray-50 rounded-r-lg">+</button>
                            </div>
                        </div>
                    </div>

                    {/* 7. ACTION BUTTONS (Normal Flow) */}
                    <div className="grid grid-cols-2 gap-3 mb-8">
                        {cartItems.some(item => (item.id === (product._id || product.id) && item.variantId === (currentVariant?._id || currentVariant?.sku))) ? (
                            <button
                                onClick={() => router.push('/cart')}
                                className="flex items-center justify-center py-3.5 rounded-xl bg-[#2D2D2D] text-white font-bold text-sm shadow-lg active:scale-95 transition-transform"
                            >
                                Go to Cart <FaChevronRight className="ml-2 text-xs" />
                            </button>
                        ) : (
                            <button
                                onClick={handleAddToCart}
                                className={`flex items-center justify-center py-3.5 rounded-xl border border-[#C08C6C] text-[#C08C6C] font-bold text-sm bg-white active:scale-95 transition-transform ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                            >
                                {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                if (!isOutOfStock) {
                                    // If already in cart, just go there. Else add and go.
                                    const inCart = cartItems.some(item => (item.id === (product._id || product.id) && item.variantId === (currentVariant?._id || currentVariant?.sku)));
                                    if (!inCart) {
                                        handleAddToCart();
                                    }
                                    router.push('/checkout');
                                }
                            }}
                            className={`flex items-center justify-center py-3.5 rounded-xl bg-[#C08C6C] text-white font-bold text-sm shadow-lg shadow-[#C08C6C]/20 active:scale-95 transition-transform ${isOutOfStock ? 'opacity-50 grayscale' : ''}`}
                        >
                            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
                        </button>
                    </div>

                    {/* 8. DESCRIPTION SECTION */}
                    <div className="mb-8 border-t border-[#E5E0D8] pt-6">
                        <h3 className="text-sm font-bold text-[#2D2D2D] mb-2">Description</h3>
                        <div className={`relative text-sm text-[#5D5D5D] leading-relaxed transition-all duration-300 ${isDescriptionExpanded ? '' : 'max-h-[4.5em] overflow-hidden'}`}>
                            {product.description || "Upgrade your wardrobe with this premium item. Perfect for formal and semi-formal occasions. Made from high-quality materials for lasting comfort and style."}
                            {!isDescriptionExpanded && <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#FDFBF7] to-transparent"></div>}
                        </div>
                        <button
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-[#C08C6C] text-xs font-bold mt-2 hover:underline"
                        >
                            {isDescriptionExpanded ? 'Read Less' : 'Read More'}
                        </button>

                        <button className="w-full mt-4 py-3 border border-[#E5E0D8] rounded-xl text-xs font-bold text-[#2D2D2D] flex justify-between items-center px-4 bg-white">
                            View All Details
                            <FaChevronRight className="text-[10px] text-[#8D8D8D]" />
                        </button>
                    </div>

                    {/* 9. RATING & REVIEW SECTION */}
                    <div id="reviews-section" className="border-t border-[#E5E0D8] pt-6 pb-8">
                        <h3 className="text-sm font-bold text-[#2D2D2D] mb-4">Ratings & Reviews</h3>

                        {/* Submit Review Card */}
                        <div className="bg-white p-4 rounded-xl border border-[#E5E0D8] shadow-sm mb-6">
                            <h4 className="text-xs font-bold text-[#2D2D2D] mb-3">Rate & Review This Product</h4>
                            <div className="flex gap-2 mb-3">
                                {[1, 2, 3, 4, 5].map(s => (
                                    <button key={s} onClick={() => setRating(s)} className={`text-xl ${rating >= s ? 'text-[#C08C6C]' : 'text-[#E5E0D8]'}`}>
                                        <FaStar />
                                    </button>
                                ))}
                            </div>
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Write your review (min 5 chars)..."
                                className="w-full bg-[#FAFAFA] border border-[#E5E0D8] rounded-lg p-3 text-xs outline-none focus:border-[#C08C6C] mb-3 resize-none h-20"
                            />
                            <button
                                onClick={handleSubmitReview}
                                className="w-full bg-[#2D2D2D] text-white text-xs font-bold py-2.5 rounded-lg active:scale-95 transition-transform"
                            >
                                Submit Review
                            </button>
                        </div>

                        {/* Existing Reviews */}
                        <div className="space-y-4">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((rev: any, idx: number) => (
                                    <div key={idx} className="bg-white p-4 rounded-xl border border-[#E5E0D8]">
                                        {editingReviewId === rev._id ? (
                                            <div>
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-xs font-bold text-[#2D2D2D]">Edit Review</span>
                                                    <button onClick={cancelEditReview} className="text-[#8D8D8D] hover:text-red-500"><FaTimes /></button>
                                                </div>
                                                <div className="flex gap-2 mb-3">
                                                    {[1, 2, 3, 4, 5].map(s => (
                                                        <button key={s} onClick={() => setEditRating(s)} className={`text-lg ${editRating >= s ? 'text-[#C08C6C]' : 'text-[#E5E0D8]'}`}>
                                                            <FaStar />
                                                        </button>
                                                    ))}
                                                </div>
                                                <textarea
                                                    value={editComment}
                                                    onChange={e => setEditComment(e.target.value)}
                                                    className="w-full bg-[#FAFAFA] border border-[#E5E0D8] rounded-lg p-3 text-xs outline-none focus:border-[#C08C6C] mb-3 resize-none h-20"
                                                />
                                                <button
                                                    onClick={() => handleUpdateReview(rev._id)}
                                                    className="w-full bg-[#2D2D2D] text-white text-xs font-bold py-2 rounded-lg active:scale-95 transition-transform"
                                                >
                                                    Update Review
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-6 h-6 rounded-full bg-[#E5E0D8] flex items-center justify-center text-[10px] font-bold text-[#5D5D5D]">
                                                            {rev.name?.[0] || 'U'}
                                                        </div>
                                                        <span className="text-xs font-bold text-[#2D2D2D]">{rev.name || 'User'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-[#8D8D8D]">{new Date(rev.createdAt || Date.now()).toLocaleDateString()}</span>
                                                        {user && rev.user === user._id && (
                                                            <div className="flex gap-2 ml-2">
                                                                <button onClick={() => startEditReview(rev)} className="text-[#C08C6C] hover:text-[#A06C4C] transition-colors" title="Edit">
                                                                    <FaEdit size={12} />
                                                                </button>
                                                                <button onClick={() => handleDeleteReview(rev._id)} className="text-red-400 hover:text-red-600 transition-colors" title="Delete">
                                                                    <FaTrash size={12} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex text-[#C08C6C] text-[10px] mb-2">
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} className={i < (rev.rating || 0) ? "" : "text-[#E5E0D8]"} />
                                                    ))}
                                                </div>
                                                <p className="text-xs text-[#5D5D5D] leading-relaxed">{rev.comment}</p>
                                            </>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <p className="text-xs text-[#8D8D8D] text-center italic">No reviews yet. Be the first to review!</p>
                            )}
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
                            {cartItems.some(item => (item.id === (product._id || product.id) && item.variantId === (currentVariant?._id || currentVariant?.sku))) ? (
                                <button onClick={() => router.push('/cart')} className="flex-1 bg-[#2D2D2D] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all flex items-center justify-center gap-2">
                                    Go to Cart <FaChevronRight className="text-xs" />
                                </button>
                            ) : (
                                <button onClick={handleAddToCart} className="flex-1 bg-[#C08C6C] text-white py-4 rounded-2xl font-bold hover:bg-[#A06C4C] transition-all">
                                    Add to Cart
                                </button>
                            )}

                            <button onClick={() => {
                                if (!isOutOfStock) {
                                    const inCart = cartItems.some(item => (item.id === (product._id || product.id) && item.variantId === (currentVariant?._id || currentVariant?.sku)));
                                    if (!inCart) {
                                        handleAddToCart();
                                    }
                                    router.push('/checkout');
                                }
                            }} className="flex-1 bg-[#2D2D2D] text-white py-4 rounded-2xl font-bold hover:bg-black transition-all">
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
