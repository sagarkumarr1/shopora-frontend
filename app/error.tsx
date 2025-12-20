'use client';

import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans text-[#2D2D2D]">
            <Navbar />

            <div className="pt-32 flex flex-col items-center justify-center min-h-[70vh] px-4">
                <div className="bg-white p-12 rounded-[2.5rem] shadow-xl shadow-red-500/5 text-center max-w-lg w-full border border-[#E5E0D8]">

                    <div className="w-24 h-24 bg-red-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <FaExclamationTriangle className="text-4xl text-red-500" />
                    </div>

                    <h1 className="text-3xl font-serif text-[#2D2D2D] mb-4">Something went wrong!</h1>
                    <p className="text-[#8D8D8D] mb-10 leading-relaxed">
                        An unexpected error occurred. Our team has been notified. Please try refreshing the page.
                    </p>

                    <button
                        onClick={() => reset()}
                        className="bg-[#2D2D2D] text-white px-10 py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 block w-full uppercase tracking-wider text-sm"
                    >
                        Try Again
                    </button>

                    <button
                        onClick={() => window.location.href = '/'}
                        className="mt-4 text-[#8D8D8D] hover:text-[#C08C6C] font-medium transition-colors text-sm"
                    >
                        Or return to Homepage
                    </button>
                </div>
            </div>
        </main>
    );
}
