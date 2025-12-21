import Navbar from '@/components/Navbar';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans text-[#2D2D2D]">
            <Navbar />

            <div className="pt-24 md:pt-32 pb-16 max-w-4xl mx-auto px-6">

                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-[#C08C6C] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">Our Story</span>
                    <h1 className="text-4xl md:text-6xl font-serif mb-6 text-[#2D2D2D]">Crafting the Future of Shopping</h1>
                    <div className="w-24 h-1 bg-[#C08C6C] mx-auto rounded-full"></div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8]">
                    <div className="prose prose-stone max-w-none">
                        <p className="text-lg leading-relaxed text-[#5D5D5D] mb-8">
                            Welcome to <strong>ApniShop</strong>, where premium quality meets effortless shopping. Founded with a simple mission — to make luxury accessible — we curate collections that inspire and elevate your everyday life.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-12">
                            <div className="bg-[#F9F9F5] p-8 rounded-2xl border border-[#E5E0D8]">
                                <h3 className="font-serif text-2xl mb-4">Quality First</h3>
                                <p className="text-[#5D5D5D] text-sm leading-relaxed">
                                    We believe that every product should stand the test of time. That's why we partner directly with artisans and manufacturers who share our commitment to excellence.
                                </p>
                            </div>
                            <div className="bg-[#F9F9F5] p-8 rounded-2xl border border-[#E5E0D8]">
                                <h3 className="font-serif text-2xl mb-4">Customer Centric</h3>
                                <p className="text-[#5D5D5D] text-sm leading-relaxed">
                                    Your satisfaction is our heartbeat. From our seamless checkout to our 24/7 support, every interaction is designed with you in mind.
                                </p>
                            </div>
                        </div>

                        <h2 className="font-serif text-3xl mb-6">Our Promise</h2>
                        <p className="text-[#5D5D5D] leading-relaxed mb-6">
                            When you shop with ApniShop, you're not just buying a product; you're joining a community that values authenticity, style, and trust. We verify every seller, inspect every shipment, and guarantee your happiness.
                        </p>
                        <p className="text-[#5D5D5D] leading-relaxed">
                            Thank you for letting us be a part of your journey.
                        </p>

                        <div className="mt-12 flex items-center justify-center">
                            <div className="text-center">
                                <p className="font-serif text-2xl italic text-[#C08C6C] mb-2">The ApniShop Team</p>
                                <span className="text-xs font-bold uppercase tracking-widest text-[#8D8D8D]">Est. 2024</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
