'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { login, reset } from '@/store/authSlice';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { AppDispatch, RootState } from '@/store/store';

export default function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const { email, password } = formData;

    const navigate = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const { user, isLoading, isError, isSuccess, message } = useSelector(
        (state: RootState) => state.auth
    );

    useEffect(() => {
        if (isError) {
            toast.error(message);
        }

        if (isSuccess || user) {
            navigate.push('/');
        }

        dispatch(reset());
    }, [user, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const userData = {
            email,
            password,
        };

        dispatch(login(userData));
    };

    if (isLoading) {
        return (
            <div className="h-screen flex items-center justify-center bg-[#FDFBF7]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C08C6C]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] p-4 font-sans">
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden max-w-md w-full border border-[#E5E0D8]">
                {/* Header Image */}
                <div className="hidden md:block relative h-48 md:h-56 w-full">
                    <Image
                        src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80"
                        alt="Fashion"
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                </div>

                <div className="p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl md:text-4xl font-serif font-bold text-[#2D2D2D] mb-2">Welcome Back</h1>
                        <p className="text-[#8D8D8D] text-sm md:text-base">Sign in to continue shopping</p>
                    </div>

                    <form onSubmit={onSubmit} className="space-y-5">
                        <div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={onChange}
                                className="w-full px-5 py-3.5 rounded-xl bg-[#F5F5F0] border border-transparent focus:bg-white focus:border-[#C08C6C] focus:ring-2 focus:ring-[#C08C6C]/20 outline-none transition-all text-[#2D2D2D] placeholder-[#A0A090] font-medium"
                                placeholder="Email Address"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={onChange}
                                className="w-full px-5 py-3.5 rounded-xl bg-[#F5F5F0] border border-transparent focus:bg-white focus:border-[#C08C6C] focus:ring-2 focus:ring-[#C08C6C]/20 outline-none transition-all text-[#2D2D2D] placeholder-[#A0A090] font-medium"
                                placeholder="Password"
                                required
                            />
                            {/* Forgot Password Link - Optional but good for UX */}
                            <div className="text-right mt-2">
                                <Link href="#" className="text-xs text-[#8D8D8D] hover:text-[#C08C6C] transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#C08C6C] hover:bg-[#A06C4C] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#C08C6C]/20 transition-all duration-300 transform hover:-translate-y-0.5 mt-2"
                        >
                            Sign In
                        </button>
                    </form>

                    <div className="mt-8 text-center pt-6 border-t border-[#F0F0E0]">
                        <p className="text-[#5D5D5D] text-sm">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#C08C6C] hover:text-[#A06C4C] font-bold transition-colors">
                                Register
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
