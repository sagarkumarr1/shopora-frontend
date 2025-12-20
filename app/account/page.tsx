'use client';

import Navbar from '@/components/Navbar';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { logout } from '@/store/authSlice';
import orderService from '@/services/orderService';
import addressService from '@/services/addressService';
import { FaBox, FaUser, FaMapMarkerAlt, FaSignOutAlt, FaChevronRight, FaSpinner, FaTruck } from 'react-icons/fa';
import Link from 'next/link';

export default function Account() {
    const { user } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'profile', 'addresses'
    const [orders, setOrders] = useState<any[]>([]);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const [loadingAddresses, setLoadingAddresses] = useState(false);

    useEffect(() => {
        if (!user) {
            router.push('/login');
        }
    }, [user, router]);

    // Fetch Data based on tab
    useEffect(() => {
        if (activeTab === 'orders') {
            setLoadingOrders(true);
            orderService.getMyOrders()
                .then(res => setOrders(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingOrders(false));
        } else if (activeTab === 'addresses') {
            setLoadingAddresses(true);
            addressService.getAddresses()
                .then(res => setAddresses(res.data))
                .catch(err => console.error(err))
                .finally(() => setLoadingAddresses(false));
        }
    }, [activeTab]);

    const handleLogout = () => {
        dispatch(logout());
        router.push('/');
    };

    const handleCancelOrder = async (e: React.MouseEvent, orderId: string) => {
        e.stopPropagation(); // Prevent navigating to details
        if (confirm('Are you sure you want to cancel this order?')) {
            try {
                await orderService.cancelOrder(orderId);
                // Refresh orders
                const res = await orderService.getMyOrders();
                setOrders(res.data);
                // toast.success('Order cancelled successfully'); // Using alert instead since toast isn't imported here
                alert('Order cancelled successfully');
            } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.error || 'Failed to cancel order');
            }
        }
    };

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!user && isMounted) {
            router.push('/login');
        }
    }, [user, router, isMounted]);

    if (!isMounted || !user) return null;

    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-20 font-sans">
            <Navbar />

            <div className="pt-24 md:pt-32 max-w-7xl mx-auto px-4 lg:px-6 flex flex-col md:flex-row gap-8">

                {/* Sidebar */}
                <div className="w-full md:w-1/4 flex flex-col gap-6">
                    {/* User Info Card */}
                    <div className="bg-white p-6 shadow-xl shadow-[#C08C6C]/5 rounded-[2rem] border border-[#E5E0D8] flex items-center gap-4">
                        <div className="w-14 h-14 bg-[#F5F5F0] rounded-full flex items-center justify-center border border-[#E5E0D8] text-[#C08C6C]">
                            <FaUser className="text-2xl" />
                        </div>
                        <div>
                            <div className="text-xs text-[#8D8D8D] uppercase tracking-wider font-bold mb-1">Hello,</div>
                            <div className="font-serif text-xl text-[#2D2D2D]">{user.name}</div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="bg-white shadow-xl shadow-[#C08C6C]/5 rounded-[2rem] border border-[#E5E0D8] overflow-hidden p-2">
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`w-full text-left px-6 py-4 flex items-center gap-4 font-medium transition-all rounded-xl mb-1 ${activeTab === 'orders' ? 'bg-[#C08C6C]/10 text-[#C08C6C]' : 'text-[#5D5D5D] hover:bg-[#F9F9F5] hover:text-[#2D2D2D]'}`}
                        >
                            <FaBox className="text-lg" />
                            <span className="flex-1">My Orders</span>
                            {activeTab === 'orders' && <FaChevronRight className="text-xs" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`w-full text-left px-6 py-4 flex items-center gap-4 font-medium transition-all rounded-xl mb-1 ${activeTab === 'profile' ? 'bg-[#C08C6C]/10 text-[#C08C6C]' : 'text-[#5D5D5D] hover:bg-[#F9F9F5] hover:text-[#2D2D2D]'}`}
                        >
                            <FaUser className="text-lg" />
                            <span className="flex-1">Account Settings</span>
                            {activeTab === 'profile' && <FaChevronRight className="text-xs" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('addresses')}
                            className={`w-full text-left px-6 py-4 flex items-center gap-4 font-medium transition-all rounded-xl mb-1 ${activeTab === 'addresses' ? 'bg-[#C08C6C]/10 text-[#C08C6C]' : 'text-[#5D5D5D] hover:bg-[#F9F9F5] hover:text-[#2D2D2D]'}`}
                        >
                            <FaMapMarkerAlt className="text-lg" />
                            <span className="flex-1">Manage Addresses</span>
                            {activeTab === 'addresses' && <FaChevronRight className="text-xs" />}
                        </button>
                        <div className="border-t border-[#F0F0E0] my-1"></div>
                        <button
                            onClick={handleLogout}
                            className="w-full text-left px-6 py-4 flex items-center gap-4 font-medium text-[#8D8D8D] hover:bg-red-50 hover:text-red-500 transition-colors rounded-xl"
                        >
                            <FaSignOutAlt className="text-lg" /> Logout
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="w-full md:w-3/4">

                    {/* MY ORDERS VIEW */}
                    {activeTab === 'orders' && (
                        <div className="bg-white shadow-xl shadow-[#C08C6C]/5 rounded-[2.5rem] border border-[#E5E0D8] overflow-hidden min-h-[600px]">
                            <h2 className="px-8 py-6 font-serif text-2xl text-[#2D2D2D] border-b border-[#F0F0E0]">My Orders</h2>

                            {loadingOrders ? (
                                <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-[#C08C6C]" /></div>
                            ) : orders.length === 0 ? (
                                <div className="p-12 text-center flex flex-col items-center">
                                    <div className="w-32 h-32 bg-[#F9F9F5] rounded-full flex items-center justify-center mb-6 text-4xl text-[#C08C6C]/30">
                                        <FaBox />
                                    </div>
                                    <h3 className="font-serif text-xl text-[#2D2D2D] mb-2">No orders found</h3>
                                    <p className="text-[#8D8D8D] mb-6">Looks like you haven't placed any orders yet.</p>
                                    <Link href="/" className="bg-[#C08C6C] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#A06C4C] transition-all shadow-lg hover:shadow-xl">Start Shopping</Link>
                                </div>
                            ) : (
                                <div>
                                    {orders.map((order) => (
                                        <div key={order._id} onClick={() => router.push(`/order/${order._id}`)} className="border-b border-[#F0F0E0] last:border-0 p-6 hover:bg-[#FDFBF7] transition-all cursor-pointer group">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Image of first item */}
                                                <div className="w-24 h-24 flex-shrink-0 bg-[#F5F5F0] rounded-xl overflow-hidden border border-[#E5E0D8]">
                                                    <img src={order.orderItems[0].image} alt="Product" className="w-full h-full object-cover mix-blend-multiply" />
                                                </div>

                                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h3 className="font-serif text-lg text-[#2D2D2D] leading-tight mb-2 group-hover:text-[#C08C6C] transition-colors">
                                                            {order.orderItems[0].title}
                                                            {order.orderItems.length > 1 && <span className="text-xs text-[#8D8D8D] ml-2 font-sans bg-[#F5F5F0] px-2 py-0.5 rounded-full">+{order.orderItems.length - 1} more</span>}
                                                        </h3>
                                                        <div className="text-xs text-[#8D8D8D] font-mono">ID: {order._id}</div>

                                                        <div className="mt-3 flex items-center gap-3">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.orderStatus === 'Delivered' ? 'bg-green-100 text-green-700' : order.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-[#FFF4E5] text-[#C08C6C]'}`}>
                                                                {order.orderStatus}
                                                            </span>
                                                            <span className="text-xs text-[#8D8D8D]">
                                                                {order.orderStatus === 'Delivered' ? `Delivered on ${new Date(order.deliveredAt || Date.now()).toLocaleDateString()}` : `Ordered on ${new Date(order.createdAt).toLocaleDateString()}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-col items-start md:items-end justify-between">
                                                        <div className="font-bold text-[#2D2D2D] text-lg">₹{order.totalPrice.toLocaleString()}</div>

                                                        {/* Cancel Button */}
                                                        {order.orderStatus !== 'Cancelled' && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Shipped' && (
                                                            <button
                                                                onClick={(e) => handleCancelOrder(e, order._id)}
                                                                className="mt-2 text-xs text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 font-medium z-10 relative transition-colors uppercase tracking-wider"
                                                            >
                                                                Cancel Order
                                                            </button>
                                                        )}

                                                        {/* Tracking Link */}
                                                        {order.trackingResult && order.trackingResult.id && (
                                                            <div className="mt-2 flex flex-col items-end">
                                                                <div className="text-[#8D8D8D] text-xs mb-1">
                                                                    <span className="font-medium text-[#2D2D2D]">{order.trackingResult.courier}</span>: {order.trackingResult.id}
                                                                </div>
                                                                {order.trackingResult.url && (
                                                                    <a
                                                                        href={order.trackingResult.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="text-[#C08C6C] hover:text-[#A06C4C] text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                                                                    >
                                                                        <FaTruck /> Track Item
                                                                    </a>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* PROFILE VIEW */}
                    {activeTab === 'profile' && (
                        <div className="bg-white shadow-xl shadow-[#C08C6C]/5 rounded-[2.5rem] border border-[#E5E0D8] p-8 md:p-10 min-h-[600px]">
                            <h2 className="font-serif text-2xl text-[#2D2D2D] border-b border-[#F0F0E0] pb-6 mb-8">Personal Information</h2>

                            <div className="space-y-8 max-w-xl">
                                <div>
                                    <label className="text-xs font-bold text-[#8D8D8D] uppercase tracking-wider block mb-2">Your Name</label>
                                    <div className="font-medium text-[#2D2D2D] text-xl pb-2 border-b border-[#E5E0D8]">{user.name}</div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[#8D8D8D] uppercase tracking-wider block mb-2">Email Address</label>
                                    <div className="font-medium text-[#2D2D2D] text-xl pb-2 border-b border-[#E5E0D8]">{user.email}</div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-[#8D8D8D] uppercase tracking-wider block mb-2">Role</label>
                                    <div className="font-medium text-[#2D2D2D] text-xl pb-2 border-b border-[#E5E0D8] capitalize">{user.role}</div>
                                </div>

                                <div className="bg-[#F9F9F5] text-[#5D5D5D] p-5 rounded-xl text-sm border border-[#E5E0D8] flex items-start gap-3">
                                    <div className="text-[#C08C6C] mt-0.5"><FaUser /></div>
                                    <p>Profile editing is currently disabled in this demo.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ADDRESSES VIEW */}
                    {activeTab === 'addresses' && (
                        <div className="bg-white shadow-xl shadow-[#C08C6C]/5 rounded-[2.5rem] border border-[#E5E0D8] p-8 md:p-10 min-h-[600px]">
                            <h2 className="font-serif text-2xl text-[#2D2D2D] border-b border-[#F0F0E0] pb-6 mb-8">Manage Addresses</h2>

                            {loadingAddresses ? (
                                <div className="flex justify-center py-20"><FaSpinner className="animate-spin text-4xl text-[#C08C6C]" /></div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {addresses.length === 0 ? (
                                        <div className="text-center py-10 text-[#8D8D8D]">No addresses saved.</div>
                                    ) : addresses.map((addr) => (
                                        <div key={addr._id} className="p-6 rounded-2xl border border-[#E5E0D8] hover:border-[#C08C6C] hover:bg-[#FDFBF7] transition-all group">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="bg-[#E5E0D8] text-[#5D5D5D] text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">Home</span>
                                                        <span className="font-serif text-lg text-[#2D2D2D]">{addr.name}</span>
                                                    </div>
                                                    <p className="text-[#5D5D5D] text-sm leading-relaxed max-w-lg">
                                                        {addr.address}, {addr.locality}, <br />
                                                        {addr.city}, {addr.state} - <span className="font-bold text-[#2D2D2D]">{addr.pincode}</span>
                                                    </p>
                                                    <div className="mt-3 text-[#2D2D2D] font-medium text-sm flex items-center gap-2">
                                                        <span className="text-[#C08C6C]">📞</span> {addr.mobile}
                                                    </div>
                                                </div>
                                                <button className="text-[#8D8D8D] hover:text-[#C08C6C] transition-colors p-2">
                                                    <span className="sr-only">Edit</span>
                                                    {/* Edit Icon could go here */}
                                                </button>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Link to Checkout to add address if empty or generally */}
                                    <Link href="/checkout" className="border-2 border-dashed border-[#E5E0D8] p-6 rounded-2xl flex flex-col items-center justify-center text-[#8D8D8D] hover:border-[#C08C6C] hover:text-[#C08C6C] hover:bg-[#FFF9F5] transition-all gap-2 group cursor-pointer">
                                        <div className="w-10 h-10 rounded-full bg-[#F5F5F0] group-hover:bg-[#C08C6C] group-hover:text-white flex items-center justify-center transition-colors">
                                            <span className="text-xl font-bold">+</span>
                                        </div>
                                        <span className="font-medium text-sm uppercase tracking-wider">Add New Address via Checkout</span>
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>
        </main>
    );
}
