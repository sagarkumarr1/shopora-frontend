'use client';

import { FaBox, FaMoneyBillWave, FaShoppingCart, FaUserFriends } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import productService from '@/services/productService';
import orderService from '@/services/orderService';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0 // Mock for now or fetch if API exists
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const products = await productService.getProducts();
                const orders = await orderService.getAllOrders(); // Now using real admin API

                const totalSales = orders.data.reduce((acc: number, order: any) => acc + (order.isPaid ? order.totalPrice : 0), 0);

                setStats({
                    totalSales,
                    totalOrders: orders.count || orders.data.length,
                    totalProducts: products.count || products.data.length,
                    totalUsers: 0 // User API not yet implemented for stats, keeping 0 or mock
                });
            } catch (e: any) {
                console.error(e);
                if (e.response && e.response.status === 401) {
                    // Token expired or invalid
                    window.location.href = '/login';
                }
            }
        };
        fetchData();
    }, []);

    const cards = [
        { title: 'Total Sales', value: `₹${stats.totalSales.toLocaleString()}`, icon: <FaMoneyBillWave />, color: 'bg-[#5F8D4E]' }, // Muted Green
        { title: 'Total Orders', value: stats.totalOrders, icon: <FaShoppingCart />, color: 'bg-[#C08C6C]' }, // Brand Primary
        { title: 'Products', value: stats.totalProducts, icon: <FaBox />, color: 'bg-[#D6A46F]' }, // Earthy Orange
        { title: 'Users', value: stats.totalUsers, icon: <FaUserFriends />, color: 'bg-[#7D7C7C]' }, // Slate
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {cards.map((card, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-6 shadow-sm flex items-center">
                        <div className={`p-4 rounded-full text-white mr-4 ${card.color} text-xl`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className="text-gray-500 text-sm">{card.title}</p>
                            <h3 className="text-2xl font-bold text-gray-800">{card.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
                <div className="text-gray-500 italic">No recent activity to show.</div>
            </div>
        </div>
    );
}
