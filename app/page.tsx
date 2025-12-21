'use client';

import { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

        {/* Categories - Mobile: Horizontal list, Desktop: Clean bar */}
        {/* Categories - Mobile: Story Style, Desktop: Bar */}
        <div className="mb-6 md:mb-10">
          <div className="md:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4">
            {/* Story Items */}
            {[
              { name: 'Fashion', img: 'https://images.unsplash.com/photo-1445205170230-05328324f311?w=150&q=80' },
              { name: 'Electronics', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=150&q=80' },
              { name: 'Beauty', img: 'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=150&q=80' },
              { name: 'Home', img: 'https://images.unsplash.com/photo-1513161455079-7dc1de15ef3e?w=150&q=80' },
              { name: 'Mobile', img: 'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=150&q=80' },
              { name: 'All', img: '/icon.png' }, // Using logo for "All"
            ].map((cat, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => window.location.href = `/search?category=${cat.name}`}>
                <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-[#C08C6C] to-[#E5E0D8]">
                  <div className="w-full h-full rounded-full border-2 border-white overflow-hidden relative">
                    <Image src={cat.img} alt={cat.name} fill className="object-cover" />
                  </div>
                </div>
                <span className="text-xs font-medium text-[#2D2D2D]">{cat.name}</span>
              </div>
            ))}
          </div>
          <div className="hidden md:block">
            <CategoryBar />
          </div>
        </div>

        {/* Hero Section - Magazine Style */}
        <section className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 mb-12 h-auto md:h-[600px]">
          {/* Main Hero Slider */}
          <div className="md:col-span-8 h-[50vh] md:h-full rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[#C08C6C]/10 relative group border border-[#E5E0D8]">
            <HeroSlider />
          </div>
          {/* Side Editorial Banners - Desktop Only */}
          <div className="hidden md:flex md:col-span-4 flex-col gap-4 md:gap-6 h-full">
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
        </section>

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
