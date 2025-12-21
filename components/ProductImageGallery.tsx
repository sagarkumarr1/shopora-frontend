'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FaRegHeart } from 'react-icons/fa';
import Link from 'next/link';

interface ProductImageGalleryProps {
    images: string[];
    activeImage: string;
    onImageSelect: (image: string) => void;
    title: string;
}

export default function ProductImageGallery({ images, activeImage, onImageSelect, title }: ProductImageGalleryProps) {
    const [zoomStyle, setZoomStyle] = useState<any>({});
    const [isHovering, setIsHovering] = useState(false);
    const mainImageRef = useRef<HTMLDivElement>(null);

    // Mobile Swipe State
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    // Handle Image Hover Zoom
    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mainImageRef.current) return;

        const { left, top, width, height } = mainImageRef.current.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;

        setZoomStyle({
            backgroundPosition: `${x}% ${y}%`,
            backgroundImage: `url(${activeImage})`
        });
    };

    // Swipe Logic
    const handleTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        const currentIndex = images.findIndex(img => img === activeImage);

        if (isLeftSwipe) {
            const nextIndex = (currentIndex + 1) % images.length;
            onImageSelect(images[nextIndex]);
        } else if (isRightSwipe) {
            const prevIndex = (currentIndex - 1 + images.length) % images.length;
            onImageSelect(images[prevIndex]);
        }
    };

    return (
        <div className="flex flex-col-reverse md:flex-row h-auto md:h-[600px] gap-4">

            {/* Desktop: Vertical Thumbnail List */}
            {images.length > 1 && (
                <div className="hidden md:flex flex-col gap-3 overflow-y-auto w-20 h-full pr-1 scrollbar-thin">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            onMouseEnter={() => onImageSelect(img)}
                            className={`relative w-16 h-16 flex-shrink-0 cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${activeImage === img ? 'border-[#C08C6C]' : 'border-transparent hover:border-[#C08C6C]/50'}`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${i + 1}`}
                                fill
                                className="object-cover"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Main Image Container */}
            <div
                className="relative bg-[#F5F5F0] rounded-[2rem] overflow-hidden flex-1 group select-none min-h-[400px] md:min-h-full flex items-center justify-center cursor-crosshair"
                ref={mainImageRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onTouchStart={(e) => {
                    setTouchStart(e.touches[0].clientX);
                    setTouchEnd(null);
                }}
                onTouchMove={(e) => setTouchEnd(e.touches[0].clientX)}
                onTouchEnd={handleTouchEnd}
            >
                {/* Normal Image (visible when not hovering) */}
                <div className={`relative w-full h-full p-8 transition-opacity duration-200 ${isHovering ? 'opacity-0' : 'opacity-100'}`}>
                    <Image
                        src={activeImage || '/placeholder.png'}
                        alt={title}
                        fill
                        className="object-contain mix-blend-multiply"
                        priority
                    />
                </div>

                {/* Zoomed Image Overlay (visible on hover) */}
                {isHovering && (
                    <div
                        className="absolute inset-0 bg-no-repeat bg-origin-content"
                        style={{
                            ...zoomStyle,
                            backgroundSize: '200%' // 2x Zoom level
                        }}
                    />
                )}

                {/* Mobile: Thumbnails / Dots */}
                <div className="md:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((img, i) => (
                        <div
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${activeImage === img ? 'bg-[#C08C6C] w-4' : 'bg-gray-300'}`}
                        />
                    ))}
                </div>

                {/* Desktop: Navigation Arrows (Optional, but nice for clicking) */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = images.findIndex(img => img === activeImage);
                        const prevIndex = (currentIndex - 1 + images.length) % images.length;
                        onImageSelect(images[prevIndex]);
                    }}
                    className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-md text-[#2D2D2D] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    ←
                </button>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        const currentIndex = images.findIndex(img => img === activeImage);
                        const nextIndex = (currentIndex + 1) % images.length;
                        onImageSelect(images[nextIndex]);
                    }}
                    className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-md text-[#2D2D2D] opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                    →
                </button>

                {/* Back Button & Heart (Preserved from old design) */}
                <div className="absolute top-6 left-6 z-20 pointer-events-none md:pointer-events-auto">
                    <Link href="/" className="text-sm font-medium text-[#8D8D8D] hover:text-[#C08C6C] flex items-center gap-2 pointer-events-auto">
                        ← Back
                    </Link>
                </div>
                <div className="absolute top-6 right-6 z-20">
                    <button className="p-3 bg-white rounded-full shadow-lg text-[#2D2D2D] hover:text-red-500 transition-colors pointer-events-auto">
                        <FaRegHeart className="text-lg" />
                    </button>
                </div>
            </div>
        </div>
    );
}
