'use plain';
'use client';

import { Provider } from 'react-redux';
import { store } from '@/store/store';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();

    return (
        <Provider store={store}>
            {children}
            <ToastContainer position="top-center" />
        </Provider>
    );
}
