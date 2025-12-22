'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

import axios from '@/services/axiosInstance';
import Link from 'next/link';

export default function HeroSlider() {
    const [current, setCurrent] = useState(0);
    const [heroes, setHeroes] = useState<any[]>([]);

    useEffect(() => {
        const fetchHeroes = async () => {
            try {
                const { data } = await axios.get('hero');
                if (data.data.length > 0) {
                    setHeroes(data.data);
                }
            } catch (error: any) {
                console.error("Failed to fetch banners:", error.response?.status, error.response?.data || error.message);
            }
        };
        fetchHeroes();
    }, []);

    const nextSlide = () => {
        setCurrent(current === heroes.length - 1 ? 0 : current + 1);
    };

    const prevSlide = () => {
        setCurrent(current === 0 ? heroes.length - 1 : current - 1);
    };

    // Auto slide
    useEffect(() => {
        if (heroes.length === 0) return;
        const interval = setInterval(() => {
            nextSlide();
        }, 5000);
        return () => clearInterval(interval);
    }, [current, heroes]);

    if (heroes.length === 0) {
        // Fallback or Loader
        return <div className="w-full h-[200px] md:h-[400px] bg-gray-200 animate-pulse rounded mt-2"></div>;
    }

    return (
        <div className="relative w-full h-full bg-[#F5F5F0] overflow-hidden group">
            {heroes.map((hero, index) => (
                <div
                    key={hero._id}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <Link href={hero.link || '/'}>
                        <div className="relative w-full h-full cursor-pointer">
                            {/* Desktop Image */}
                            <div className={`relative w-full h-full ${hero.mobileImage ? 'hidden md:block' : ''}`}>
                                <Image
                                    src={hero.image}
                                    alt={hero.title || 'Banner'}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                    sizes="100vw"
                                />
                            </div>

                            {/* Mobile Image (if available) */}
                            {hero.mobileImage && (
                                <div className="relative w-full h-full md:hidden">
                                    <Image
                                        src={hero.mobileImage}
                                        alt={hero.title || 'Mobile Banner'}
                                        fill
                                        className="object-cover"
                                        priority={index === 0}
                                        sizes="100vw"
                                    />
                                </div>
                            )}
                            {/* Overlay/Caption */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent flex items-end p-6 md:p-12">
                                <div className="text-white max-w-2xl transform transition-transform duration-700 translate-y-0 group-hover:-translate-y-2">
                                    {hero.subtitle && <p className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold mb-2 md:mb-4 text-white/90">{hero.subtitle}</p>}
                                    {hero.title && <h2 className="text-3xl md:text-6xl font-bold font-serif mb-4 leading-tight">{hero.title}</h2>}
                                    <span className="inline-block border-b border-white pb-1 text-sm font-medium hover:text-stone-200 transition-colors">Discover More</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>
            ))}

            {/* Controls */}
            <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 z-20 flex gap-2">
                <button onClick={prevSlide} className="bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all border border-white/20">
                    <IoIosArrowBack className="text-lg" />
                </button>
                <button onClick={nextSlide} className="bg-white/10 hover:bg-white/30 backdrop-blur-md text-white p-3 rounded-full transition-all border border-white/20">
                    <IoIosArrowForward className="text-lg" />
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-6 left-6 md:left-12 z-20 flex space-x-3">
                {heroes.map((_, index) => (
                    <div
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={`h-1 rounded-full cursor-pointer transition-all duration-300 ${index === current ? 'bg-white w-8 md:w-12' : 'bg-white/40 w-4 hover:bg-white/60'}`}
                    ></div>
                ))}
            </div>
        </div>
    );
}
