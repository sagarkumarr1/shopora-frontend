'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { FaGhost } from 'react-icons/fa';

export default function NotFound() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans text-[#2D2D2D]">
            <Navbar />

            <div className="pt-32 flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-[#C08C6C]/5 text-center max-w-lg w-full border border-[#E5E0D8]">

                    <div className="w-24 h-24 bg-[#F5F5F0] rounded-full mx-auto mb-6 flex items-center justify-center">
                        <FaGhost className="text-4xl text-[#C08C6C]" />
                    </div>

                    <h1 className="text-4xl font-serif text-[#2D2D2D] mb-4">404</h1>
                    <h2 className="text-xl font-serif text-[#5D5D5D] mb-6">Page Not Found</h2>
                    <p className="text-[#8D8D8D] mb-10 leading-relaxed">
                        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                    </p>

                    <Link
                        href="/"
                        className="bg-[#C08C6C] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#A06C4C] transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block w-full uppercase tracking-wider text-sm"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        </main>
    );
}
