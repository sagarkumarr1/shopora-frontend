'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { IoIosArrowDown } from "react-icons/io";
import Navbar from '@/components/Navbar';
import CategoryBar from '@/components/CategoryBar';
import HeroSlider from '@/components/HeroSlider';
import ProductRow from '@/components/ProductRow';
import TrustBar from '@/components/TrustBar';
import Image from 'next/image';
import productService from '@/services/productService';

// Mock Data


export default function Home() {
  const [bestDeals, setBestDeals] = useState<any[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Categories
        const catRes = await productService.getCategories();
        setCategories(catRes.data);

        // Fetch Category Deals
        const deals = await productService.getCategoryDeals();
        setBestDeals(deals.data);

        // Fetch Featured (e.g., Newest)
        const featured = await productService.getProducts({ sort: 'newest' });
        setFeaturedProducts(featured.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching homepage products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <main className="bg-gray-100 min-h-screen pb-10">
        <Navbar />
        <div className="pt-24 flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#FDFBF7] min-h-screen pb-24 md:pb-12 font-sans px-4 md:px-8">
      <Navbar />
      <div className="pt-20 md:pt-24 max-w-[1800px] mx-auto">

        {/* Mobile: Categories & Hero Redesign */}
        <div className="md:hidden space-y-8 mb-8">
          {/* Search handled in Navbar, so spacing already provided by padding-top */}

          {/* 1. Mobile Hero Card */}
          <div className="relative w-full h-[220px] bg-[#EBE3D9] rounded-[2rem] overflow-hidden flex items-center px-6">
            <div className="z-10 flex flex-col items-start gap-1">
              <h3 className="text-[#5A4A42] font-medium text-lg tracking-wide">New Collection</h3>
              <h2 className="text-[#5A4A42] font-serif text-3xl mb-3">Up to <span className="font-bold">40% OFF</span></h2>
              <button className="bg-[#C08C6C] text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-[#A87555] transition-colors">
                Shop Now
              </button>
              {/* Pagination Dots */}
              <div className="flex gap-1.5 mt-6 ml-1">
                <div className="w-2 h-2 rounded-full bg-white"></div>
                <div className="w-2 h-2 rounded-full bg-white/40"></div>
                <div className="w-2 h-2 rounded-full bg-white/40"></div>
              </div>
            </div>
            {/* Hero Image (Right Side) */}
            <div className="absolute right-0 bottom-0 top-0 w-1/2">
              <Image
                src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80"
                alt="Fashion Model"
                fill
                className="object-cover object-top mask-image-gradient"
              />
            </div>
          </div>

          {/* 2. Categories */}
          <div>
            <div className="flex justify-between items-center mb-4 px-1">
              <h3 className="font-serif text-[1.35rem] text-[#2D2D2D] font-medium">Categories</h3>
              <Link href="/categories" className="text-[#C08C6C] text-sm font-medium flex items-center gap-1">
                View all <IoIosArrowDown className="-rotate-90 text-xs" />
              </Link>
            </div>

            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide px-1">
              {categories.map((cat, i) => (
                <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={() => window.location.href = `/search?category=${encodeURIComponent(cat.name)}`}>
                  <div className="w-[72px] h-[72px] rounded-full bg-[#F5F1EB] flex items-center justify-center shadow-sm border border-[#EBE3D9] group-hover:bg-[#EBE3D9] transition-colors overflow-hidden">
                    {cat.image && cat.image !== 'no-photo.jpg' ? (
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <img src="https://cdn-icons-png.flaticon.com/128/706/706614.png" alt={cat.name} className="w-8 h-8 opacity-50 group-hover:opacity-80 transition-opacity sepia-[0.3]" />
                    )}
                  </div>
                  <span className="text-xs font-medium text-[#5D5D5D] tracking-wide capitalize">{cat.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Desktop Hero & Categories (Keep existing but hidden on mobile) */}
        <div className="hidden md:block mb-10">
          <CategoryBar />
          <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 h-[600px]">
            {/* Main Hero Slider */}
            <div className="md:col-span-8 h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#C08C6C]/10 relative group border border-[#E5E0D8]">
              <HeroSlider />
            </div>
            {/* Side Editorial Banners */}
            <div className="flex md:col-span-4 flex-col gap-6 h-full">
              <div className="relative flex-1 rounded-[2.5rem] overflow-hidden shadow-xl shadow-[#C08C6C]/5 group cursor-pointer border border-[#E5E0D8]">
                <Image src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80" fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="New Arrivals" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors p-8 flex items-end">
                  <div>
                    <span className="text-white/80 text-xs uppercase tracking-widest font-bold mb-2 block">New Season</span>
                    <h3 className="text-white text-3xl font-serif">Urban Collection</h3>
                  </div>
                </div>
              </div>
              <div className="relative flex-1 rounded-[2.5rem] overflow-hidden shadow-xl shadow-[#C08C6C]/5 group cursor-pointer border border-[#E5E0D8]">
                <Image src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80" fill className="object-cover group-hover:scale-105 transition-transform duration-700" alt="Audio" />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors p-8 flex items-end">
                  <div>
                    <span className="text-white/80 text-xs uppercase tracking-widest font-bold mb-2 block">Audio</span>
                    <h3 className="text-white text-3xl font-serif">Premium Sound</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Curated Collections (Best Deals) */}
        <section className="mb-16">
          <div className="flex justify-between items-end mb-8 px-2">
            <div>
              <span className="text-[#C08C6C] text-xs font-bold tracking-widest uppercase mb-2 block">Handpicked for you</span>
              <h2 className="text-3xl md:text-5xl font-serif text-[#2D2D2D]">Curated Collections</h2>
            </div>
            <button className="text-[#8D8D8D] hover:text-[#C08C6C] text-sm font-bold uppercase tracking-wider transition-colors border-b border-transparent hover:border-[#C08C6C] pb-0.5">Explore All</button>
          </div>

          <div className="flex gap-4 md:gap-8 overflow-x-auto pb-8 scrollbar-hide px-2 -mx-2 md:mx-0 md:px-0 snap-x">
            {bestDeals.map((deal, idx) => (
              <div
                key={idx}
                onClick={() => window.location.href = `/search?category=${deal.category}&sort=price_low`}
                className="min-w-[220px] md:min-w-[320px] h-[340px] md:h-[440px] rounded-[2rem] relative overflow-hidden cursor-pointer group snap-center shadow-lg shadow-[#C08C6C]/10 border border-[#E5E0D8]"
              >
                <Image
                  src={deal.image || '/placeholder.png'}
                  alt={deal.category}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-8 flex flex-col justify-end text-white">
                  <h3 className="font-serif text-2xl md:text-3xl mb-2">{deal.category}</h3>
                  <div className="flex items-center gap-3">
                    <span className="text-white/80 text-sm">Starting at</span>
                    <span className="text-white font-bold text-xl">₹{deal.minPrice?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="mt-6 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    <span className="inline-block bg-white text-[#2D2D2D] px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#C08C6C] hover:text-white transition-colors">Shop Now</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Editorial Grid / Featured Products */}
        <ProductRow title="Featured Products" products={featuredProducts} />

        {/* Brand Promise / Trust Markers */}
        <TrustBar />
      </div>
    </main>
  );
}
