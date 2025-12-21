'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAddresses, addAddress, deleteAddress } from '@/store/addressSlice';
import { FaTrash, FaPlus, FaCheckCircle, FaMoneyBillWave, FaCreditCard, FaChevronRight, FaTruck, FaUndo } from 'react-icons/fa';
import orderService from '@/services/orderService';
import { toast } from 'react-toastify';
import { clearCart } from '@/store/cartSlice';
import Link from 'next/link';

export default function Checkout() {
    const { checkoutItems } = useSelector((state: RootState) => state.cart);
    const { user } = useSelector((state: RootState) => state.auth);
    const { addresses, isLoading } = useSelector((state: RootState) => state.address);
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();

    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [showAddForm, setShowAddForm] = useState(false);
    const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment
    const [paymentMethod, setPaymentMethod] = useState('COD');

    // New Address Form Data
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        pincode: '',
        locality: '',
        address: '',
        city: '',
        state: ''
    });

    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [postOffices, setPostOffices] = useState<string[]>([]);

    useEffect(() => {
        if (checkoutItems.length === 0) {
            router.push('/');
        }
        dispatch(getAddresses());
    }, [checkoutItems, router, dispatch]);

    useEffect(() => {
        if (addresses.length > 0 && !selectedAddressId) {
            const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
            setSelectedAddressId(defaultAddr._id);
        }
    }, [addresses, selectedAddressId]);

    // Pincode Auto-fill Logic
    useEffect(() => {
        if (formData.pincode.length === 6) {
            const fetchPincodeDetails = async () => {
                setPincodeLoading(true);
                try {
                    const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
                    const data = await response.json();

                    if (data && data[0].Status === "Success") {
                        const details = data[0].PostOffice;
                        const city = details[0].District;
                        const state = details[0].State;
                        const offices = details.map((po: any) => po.Name);

                        setPostOffices(offices);
                        setFormData(prev => ({
                            ...prev,
                            city: city,
                            state: state,
                            locality: offices.length === 1 ? offices[0] : '' // Auto-select if only one
                        }));
                        toast.success("City and State auto-filled!");
                    } else {
                        toast.error("Invalid Pincode");
                        setPostOffices([]);
                    }
                } catch (error) {
                    console.error("Error fetching pincode:", error);
                    toast.error("Failed to fetch pincode details");
                } finally {
                    setPincodeLoading(false);
                }
            };

            fetchPincodeDetails();
        } else {
            setPostOffices([]);
        }
    }, [formData.pincode]);

    const totalItems = checkoutItems.reduce((acc, item) => acc + item.quantity, 0);
    const totalPrice = checkoutItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    // Shipping Logic: Free if > 500, else 50
    const deliveryCharges = totalPrice > 500 ? 0 : 50;
    const finalAmount = totalPrice + deliveryCharges;

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await dispatch(addAddress(formData)).unwrap();
            toast.success("Address added successfully");
            setShowAddForm(false);
            setFormData({ name: '', mobile: '', pincode: '', locality: '', address: '', city: '', state: '' });
        } catch (error: any) {
            toast.error(typeof error === 'string' ? error : "Failed to add address");
        }
    };

    const handleProceedToPayment = () => {
        if (!selectedAddressId) return toast.error("Please select a delivery address");
        setActiveStep(2);
    };

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return toast.error("Please select an address");

        const selectedAddress = addresses.find(a => a._id === selectedAddressId);
        if (!selectedAddress) return;

        const orderData = {
            orderItems: checkoutItems.map(item => ({
                title: item.title,
                quantity: Number(item.quantity) || 1,
                image: item.image || 'https://via.placeholder.com/150', // Client-side fallback to prevent backend crash
                price: Number(item.price) || 0,
                product: item.id,
                variantId: item.variantId,
                variantAttributes: item.variantAttributes
            })),
            shippingAddress: {
                name: selectedAddress.name,
                mobile: selectedAddress.mobile,
                address: selectedAddress.address,
                city: selectedAddress.city,
                pincode: selectedAddress.pincode,
                state: selectedAddress.state,
                locality: selectedAddress.locality
            },
            paymentMethod: paymentMethod,
            itemsPrice: totalPrice,
            shippingPrice: deliveryCharges,
            taxPrice: 0,
            totalPrice: finalAmount
        };

        try {
            const response = await orderService.createOrder(orderData);
            toast.success("Order Placed Successfully!", { autoClose: 2000 });
            dispatch(clearCart());
            router.push(`/order-success?orderId=${response.data._id}`);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Failed to place order");
        }
    };

    if (checkoutItems.length === 0) return null;

    return (
        <main className="bg-[#FDFBF7] min-h-screen pb-20 font-sans">
            <Navbar />

            {/* Header / Breadcrumbs */}
            <div className="pt-24 md:pt-32 max-w-6xl mx-auto px-4 lg:px-6 mb-8">
                <div className="flex items-center gap-2 text-sm text-[#8D8D8D] mb-4">
                    <Link href="/" className="hover:text-[#2D2D2D]">Home</Link>
                    <FaChevronRight className="text-xs" />
                    <Link href="/cart" className="hover:text-[#2D2D2D]">Cart</Link>
                    <FaChevronRight className="text-xs" />
                    <span className="text-[#2D2D2D] font-medium">Checkout</span>
                </div>
                <h1 className="text-4xl font-serif text-[#2D2D2D]">Checkout</h1>
            </div>

            <div className="max-w-6xl mx-auto px-4 lg:px-6 flex flex-col lg:flex-row gap-8">

                {/* Left: Steps Area */}
                <div className="flex-1 space-y-6">

                    {/* Step 1: Delivery Address */}
                    <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${activeStep === 1 ? 'border-[#C08C6C] shadow-lg shadow-[#C08C6C]/5' : 'border-[#E5E0D8] opacity-60'}`}>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 1 ? 'bg-[#C08C6C] text-white' : 'bg-[#F5F5F0] text-[#8D8D8D]'}`}>1</div>
                                <h3 className="font-serif text-xl text-[#2D2D2D]">Delivery Address</h3>
                            </div>

                            {activeStep === 1 && (
                                <div className="ml-12 space-y-4">
                                    {/* Saved Addresses */}
                                    {addresses.map((addr) => (
                                        <div
                                            key={addr._id}
                                            className={`relative p-5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-4 ${selectedAddressId === addr._id ? 'border-[#C08C6C] bg-[#C08C6C]/5' : 'border-[#F0F0E0] hover:border-[#E5E0D8]'}`}
                                            onClick={() => setSelectedAddressId(addr._id)}
                                        >
                                            <div className={`w-5 h-5 rounded-full border-2 mt-1 flex-shrink-0 flex items-center justify-center ${selectedAddressId === addr._id ? 'border-[#C08C6C]' : 'border-[#D1D1D1]'}`}>
                                                {selectedAddressId === addr._id && <div className="w-2.5 h-2.5 rounded-full bg-[#C08C6C]"></div>}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <span className="font-bold text-[#2D2D2D] text-lg">{addr.name}</span>
                                                        <span className="ml-3 font-medium text-[#5D5D5D] bg-[#F5F5F0] px-2 py-0.5 rounded text-sm">{addr.mobile}</span>
                                                    </div>
                                                    <button onClick={(e) => { e.stopPropagation(); dispatch(deleteAddress(addr._id)); }} className="text-[#8D8D8D] hover:text-red-500 transition-colors bg-white p-2 rounded-full shadow-sm">
                                                        <FaTrash size={12} />
                                                    </button>
                                                </div>
                                                <p className="text-[#5D5D5D] mt-2 leading-relaxed text-sm">
                                                    {addr.address}, {addr.locality}, {addr.city}, <br />
                                                    {addr.state} - <span className="font-bold">{addr.pincode}</span>
                                                </p>
                                                {selectedAddressId === addr._id && (
                                                    <div className="absolute top-4 right-4 hidden md:block">
                                                        {/* Optional edit button or indicator */}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Add New Address Button */}
                                    {!showAddForm ? (
                                        <button
                                            onClick={() => setShowAddForm(true)}
                                            className="w-full py-4 border-2 border-dashed border-[#C08C6C]/40 rounded-xl text-[#C08C6C] font-bold flex items-center justify-center gap-2 hover:bg-[#C08C6C]/5 transition-colors uppercase tracking-wider text-sm"
                                        >
                                            <FaPlus /> Add a New Address
                                        </button>
                                    ) : (
                                        <div className="bg-[#F9F9F5] p-6 rounded-xl border border-[#E5E0D8] mt-4">
                                            <h4 className="font-serif text-[#2D2D2D] text-lg mb-4">Add New Address</h4>
                                            <form onSubmit={handleAddAddress} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input required placeholder="Full Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]" />
                                                    <input required placeholder="Mobile Number" value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]" />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="relative">
                                                        <input required placeholder="Pincode" value={formData.pincode} onChange={e => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]" />
                                                        {pincodeLoading && (
                                                            <div className="absolute right-3 top-3 animate-spin rounded-full h-5 w-5 border-b-2 border-[#C08C6C]"></div>
                                                        )}
                                                    </div>

                                                    {postOffices.length > 0 ? (
                                                        <select
                                                            required
                                                            value={formData.locality}
                                                            onChange={e => setFormData({ ...formData, locality: e.target.value })}
                                                            className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]"
                                                        >
                                                            <option value="">Select Locality / Post Office</option>
                                                            {postOffices.map((po, idx) => (
                                                                <option key={idx} value={po}>{po}</option>
                                                            ))}
                                                        </select>
                                                    ) : (
                                                        <input required placeholder="Locality" value={formData.locality} onChange={e => setFormData({ ...formData, locality: e.target.value })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]" />
                                                    )}
                                                </div>
                                                <textarea required placeholder="Address (Area and Street)" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white h-24 text-[#2D2D2D]"></textarea>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <input required placeholder="City/District/Town" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]" />
                                                    <input required placeholder="State" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full p-3 rounded-lg border border-[#E5E0D8] focus:border-[#C08C6C] outline-none bg-white text-[#2D2D2D]" />
                                                </div>
                                                <div className="flex gap-3 pt-2">
                                                    <button type="submit" className="bg-[#2D2D2D] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-black transition-colors text-sm">Save Address</button>
                                                    <button type="button" onClick={() => setShowAddForm(false)} className="text-[#5D5D5D] px-6 py-2.5 font-medium hover:text-[#2D2D2D] text-sm">Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Edit Button when collapsed */}
                            {activeStep > 1 && selectedAddressId && (
                                <div className="ml-12">
                                    <p className="text-[#2D2D2D] font-medium mb-1">{addresses.find(a => a._id === selectedAddressId)?.name}</p>
                                    <p className="text-[#8D8D8D] text-sm truncate max-w-md">{addresses.find(a => a._id === selectedAddressId)?.address}...</p>
                                    <button onClick={() => setActiveStep(1)} className="text-[#C08C6C] text-sm font-bold uppercase mt-2 hover:underline">Change</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Step 2: Payment Options */}
                    <div className={`bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${activeStep === 2 ? 'border-[#C08C6C] shadow-lg shadow-[#C08C6C]/5' : 'border-[#E5E0D8] opacity-60'}`}>
                        <div className="p-6 md:p-8">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${activeStep === 2 ? 'bg-[#C08C6C] text-white' : 'bg-[#F5F5F0] text-[#8D8D8D]'}`}>2</div>
                                <h3 className="font-serif text-xl text-[#2D2D2D]">Payment Options</h3>
                            </div>

                            {activeStep === 2 && (
                                <div className="ml-12 space-y-4">
                                    {/* COD */}
                                    <div
                                        onClick={() => setPaymentMethod('COD')}
                                        className={`cursor-pointer p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'COD' ? 'border-[#C08C6C] bg-[#C08C6C]/5' : 'border-[#F0F0E0] hover:border-[#E5E0D8]'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-[#C08C6C]' : 'border-[#D1D1D1]'}`}>
                                            {paymentMethod === 'COD' && <div className="w-2.5 h-2.5 rounded-full bg-[#C08C6C]"></div>}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#E5E0D8] text-[#5D5D5D] flex items-center justify-center text-lg">
                                            <FaMoneyBillWave />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#2D2D2D]">Cash on Delivery</h4>
                                            <p className="text-[#8D8D8D] text-sm">Pay with cash upon delivery.</p>
                                        </div>
                                    </div>

                                    {/* Online (Disabled/Mock) */}
                                    <div
                                        onClick={() => setPaymentMethod('Online')}
                                        className={`cursor-pointer p-5 rounded-xl border-2 flex items-center gap-4 transition-all opacity-60 ${paymentMethod === 'Online' ? 'border-[#C08C6C] bg-[#C08C6C]/5' : 'border-[#F0F0E0] hover:border-[#E5E0D8]'}`}
                                    >
                                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${paymentMethod === 'Online' ? 'border-[#C08C6C]' : 'border-[#D1D1D1]'}`}>
                                            {paymentMethod === 'Online' && <div className="w-2.5 h-2.5 rounded-full bg-[#C08C6C]"></div>}
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-[#F5F5F0] text-[#8D8D8D] flex items-center justify-center text-lg">
                                            <FaCreditCard />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#2D2D2D]">Online Payment</h4>
                                            <p className="text-[#8D8D8D] text-sm">Credit/Debit Card, UPI, Netbanking</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right: Order Summary */}
                <div className="w-full lg:w-[24rem] flex-shrink-0">
                    <div className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-[#C08C6C]/10 border border-[#E5E0D8] sticky top-32">
                        <h3 className="font-serif text-xl text-[#2D2D2D] mb-6 border-b border-[#F0F0E0] pb-4">Order Summary</h3>

                        <div className="space-y-4 mb-6 text-[#5D5D5D] text-sm">
                            <div className="flex justify-between">
                                <span>Bag Total</span>
                                <span className="font-bold text-[#2D2D2D]">₹{totalPrice.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Charges</span>
                                <span className={`font-bold ${deliveryCharges === 0 ? 'text-green-600' : 'text-[#2D2D2D]'}`}>
                                    {deliveryCharges === 0 ? 'Free' : `₹${deliveryCharges}`}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-dashed border-[#E5E0D8] pt-6 mb-8">
                            <span className="font-medium text-[#2D2D2D] text-lg">Total Payable</span>
                            <span className="text-2xl font-bold text-[#2D2D2D] font-sans">₹{finalAmount.toLocaleString()}</span>
                        </div>

                        {activeStep === 1 ? (
                            <button
                                onClick={handleProceedToPayment}
                                className="w-full bg-[#C08C6C] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#A06C4C] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
                            >
                                Proceed to Payment
                            </button>
                        ) : (
                            <button
                                onClick={handlePlaceOrder}
                                className="w-full bg-[#C08C6C] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#A06C4C] hover:-translate-y-1 transition-all uppercase tracking-wider text-sm"
                            >
                                {paymentMethod === 'COD' ? 'Confirm Order' : 'Pay Now'}
                            </button>
                        )}

                        <div className="mt-6 flex flex-wrap justify-center gap-4 opacity-70">
                            <div className="flex items-center gap-2 text-[#8D8D8D] text-xs font-bold uppercase tracking-wider">
                                <FaTruck className="text-[#C08C6C]" /> Free Delivery
                            </div>
                            <div className="flex items-center gap-2 text-[#8D8D8D] text-xs font-bold uppercase tracking-wider">
                                <FaUndo className="text-[#C08C6C]" /> Easy Returns
                            </div>
                            <div className="flex items-center gap-2 text-[#8D8D8D] text-xs font-bold uppercase tracking-wider">
                                <FaMoneyBillWave className="text-[#C08C6C]" /> COD Available
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            {/* Mobile Fixed Action Bar */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-[#E5E0D8] p-4 z-40">
                <div className="flex justify-between items-center mb-2 px-2">
                    <span className="text-xs text-[#5D5D5D] font-medium">Total Payable</span>
                    <span className="text-lg font-bold text-[#2D2D2D]">₹{finalAmount.toLocaleString()}</span>
                </div>
                {activeStep === 1 ? (
                    <button
                        onClick={handleProceedToPayment}
                        className="w-full bg-[#C08C6C] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#A06C4C] transition-all uppercase tracking-wider text-sm"
                    >
                        Proceed to Payment
                    </button>
                ) : (
                    <button
                        onClick={handlePlaceOrder}
                        className="w-full bg-[#C08C6C] text-white font-bold py-4 rounded-xl shadow-lg hover:bg-[#A06C4C] transition-all uppercase tracking-wider text-sm"
                    >
                        {paymentMethod === 'COD' ? 'Confirm Order' : 'Pay Now'}
                    </button>
                )}
            </div>
        </main>
    );
}
