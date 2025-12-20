'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { FaTimesCircle } from 'react-icons/fa';

export default function OrderFailedPage() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans text-[#2D2D2D]">
            <Navbar />

            <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] px-4">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-red-500/5 text-center max-w-lg w-full border border-[#E5E0D8]">

                    <div className="w-24 h-24 bg-red-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <FaTimesCircle className="text-4xl text-red-500" />
                    </div>

                    <h1 className="text-3xl font-serif text-[#2D2D2D] mb-4">Order Failed</h1>
                    <p className="text-[#8D8D8D] mb-8 leading-relaxed">
                        We couldn't process your payment. This might be due to a network issue or payment decline. Don't worry, you haven't been charged.
                    </p>

                    <div className="space-y-4">
                        <Link
                            href="/checkout"
                            className="bg-[#C08C6C] text-white px-8 py-4 rounded-xl font-bold hover:bg-[#A06C4C] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block w-full"
                        >
                            Try Again
                        </Link>
                        <Link
                            href="/cart"
                            className="bg-[#F5F5F0] text-[#8D8D8D] px-8 py-4 rounded-xl font-bold hover:bg-[#E5E0D8] hover:text-[#5D5D5D] transition-colors block w-full"
                        >
                            Return to Cart
                        </Link>
                    </div>

                </div>
            </div>
        </main>
    );
}
