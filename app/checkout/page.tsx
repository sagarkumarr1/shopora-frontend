'use client';

import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import Navbar from '@/components/Navbar';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAddresses, addAddress, deleteAddress } from '@/store/addressSlice';
import { FaTrash, FaPlus, FaCheckCircle, FaMoneyBillWave, FaCreditCard, FaChevronRight, FaTruck, FaUndo, FaUser } from 'react-icons/fa';
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

        // Payment Simulation
        if (paymentMethod === 'Online') {
            // Show processing modal or toast
            const toastId = toast.loading("Processing Secure Payment...", { autoClose: false });

            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            toast.update(toastId, { render: "Payment Authorized!", type: "success", isLoading: false, autoClose: 1000 });
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const orderData = {
            orderItems: checkoutItems.map(item => ({
                title: item.title,
                quantity: Number(item.quantity) || 1,
                image: item.image || 'https://via.placeholder.com/150',
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
            totalPrice: finalAmount,
            // If online, ideally we send paymentResult, but for now just the method
            isPaid: paymentMethod === 'Online',
            paidAt: paymentMethod === 'Online' ? Date.now() : undefined,
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
        <main className="bg-[#FDFBF7] min-h-screen pb-24 md:pb-20 font-sans text-[#2D2D2D]">
            {/* Desktop Navbar */}
            <div className="hidden md:block">
                <Navbar />
            </div>

            {/* Mobile Header (Fixed) */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white z-50 px-4 h-16 flex items-center shadow-sm border-b border-[#F0F0E0]">
                <button onClick={() => router.back()} className="mr-4 text-[#2D2D2D] p-1">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </button>
                <h1 className="text-xl font-medium text-[#2D2D2D]">Checkout</h1>
            </div>

            {/* Main Content */}
            <div className="pt-20 md:pt-32 max-w-6xl mx-auto px-4 lg:px-6 flex flex-col lg:flex-row gap-8">

                {/* Left: Steps Area */}
                <div className="flex-1 space-y-6">

                    {/* Stepper (Mobile & Desktop) */}
                    <div className="bg-white p-6 rounded-[2rem] border border-[#E5E0D8]">
                        <div className="relative flex justify-between items-center max-w-sm mx-auto">
                            {/* Connecting Line */}
                            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#E5E0D8] -z-10"></div>

                            {/* Step 1: Address */}
                            <div className="flex flex-col items-center bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${activeStep >= 1 ? 'bg-[#C08C6C] border-[#C08C6C] text-white' : 'bg-white border-[#E5E0D8] text-[#8D8D8D]'}`}>
                                    {activeStep > 1 ? <FaCheckCircle /> : '1'}
                                </div>
                                <span className={`text-xs mt-1 font-medium ${activeStep >= 1 ? 'text-[#C08C6C]' : 'text-[#8D8D8D]'}`}>Address</span>
                            </div>

                            {/* Step 2: Delivery */}
                            <div className="flex flex-col items-center bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${activeStep >= 2 ? 'bg-[#C08C6C] border-[#C08C6C] text-white' : 'bg-white border-[#E5E0D8] text-[#8D8D8D]'}`}>
                                    {activeStep > 2 ? <FaCheckCircle /> : '2'}
                                </div>
                                <span className={`text-xs mt-1 font-medium ${activeStep >= 2 ? 'text-[#C08C6C]' : 'text-[#8D8D8D]'}`}>Delivery</span>
                            </div>

                            {/* Step 3: Payment */}
                            <div className="flex flex-col items-center bg-white px-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${activeStep >= 3 ? 'bg-[#C08C6C] border-[#C08C6C] text-white' : 'bg-white border-[#E5E0D8] text-[#8D8D8D]'}`}>
                                    3
                                </div>
                                <span className={`text-xs mt-1 font-medium ${activeStep >= 3 ? 'text-[#C08C6C]' : 'text-[#8D8D8D]'}`}>Payment</span>
                            </div>
                        </div>
                    </div>


                    {/* Step 1 Content: Shipping Address */}
                    {activeStep === 1 && (
                        <div className="space-y-4">
                            <div className="flex justify-between items-center mb-2 px-1">
                                <h3 className="font-serif text-lg text-[#2D2D2D]">Shipping Address</h3>
                                {addresses.length > 0 && (
                                    <button onClick={() => setShowAddForm(true)} className="text-[#C08C6C] text-sm font-medium hover:underline">
                                        Change {'>'}
                                    </button>
                                )}
                            </div>

                            {/* Selected Address Card */}
                            {addresses.length > 0 ? (
                                !showAddForm ? (
                                    <div className="bg-white p-5 rounded-[1.5rem] border border-[#E5E0D8] shadow-sm relative">
                                        <div className="flex items-start gap-4">
                                            {/* Avatar/Icon */}
                                            <div className="w-10 h-10 rounded-full bg-[#F5F5F0] flex items-center justify-center text-[#8D8D8D]">
                                                <FaUser />
                                            </div>

                                            <div className="flex-1">
                                                {selectedAddressId && addresses.find(a => a._id === selectedAddressId) ? (
                                                    <div>
                                                        <h4 className="font-bold text-[#2D2D2D] text-lg">{addresses.find(a => a._id === selectedAddressId)?.name}</h4>
                                                        <p className="text-[#5D5D5D] text-sm leading-relaxed mt-1">
                                                            {addresses.find(a => a._id === selectedAddressId)?.address}, {addresses.find(a => a._id === selectedAddressId)?.city}
                                                            <br />
                                                            {addresses.find(a => a._id === selectedAddressId)?.state} - {addresses.find(a => a._id === selectedAddressId)?.pincode}
                                                        </p>
                                                        <p className="text-[#5D5D5D] text-sm font-medium mt-1">Phone: {addresses.find(a => a._id === selectedAddressId)?.mobile}</p>
                                                    </div>
                                                ) : (
                                                    <p className="text-[#8D8D8D]">No address selected</p>
                                                )}
                                            </div>

                                            {/* Checkmark Circle */}
                                            <div className="w-6 h-6 rounded-full bg-[#C08C6C] flex items-center justify-center text-white text-xs shadow-md">
                                                <FaCheckCircle />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setShowAddForm(true)}
                                            className="w-full mt-4 py-3 border border-[#E5E0D8] rounded-xl text-[#2D2D2D] font-medium text-sm hover:bg-[#F9F9F5] transition-colors"
                                        >
                                            Change
                                        </button>
                                    </div>
                                ) : null
                            ) : null}

                            {/* Add New Address Form (or List if modifying) */}
                            {showAddForm && (
                                <div className="bg-white p-6 rounded-[1.5rem] border border-[#E5E0D8]">
                                    <h4 className="font-serif text-[#2D2D2D] text-lg mb-4">Add / Select Address</h4>

                                    {/* List existing addresses to select */}
                                    <div className="space-y-3 mb-6">
                                        {addresses.map(addr => (
                                            <div
                                                key={addr._id}
                                                onClick={() => { setSelectedAddressId(addr._id); setShowAddForm(false); }}
                                                className={`p-4 rounded-xl border cursor-pointer flex items-center justify-between ${selectedAddressId === addr._id ? 'border-[#C08C6C] bg-[#C08C6C]/5' : 'border-[#E5E0D8]'}`}
                                            >
                                                <div>
                                                    <p className="font-bold text-sm">{addr.name}</p>
                                                    <p className="text-xs text-[#5D5D5D] truncate w-64">{addr.address}, {addr.city}</p>
                                                </div>
                                                {selectedAddressId === addr._id && <FaCheckCircle className="text-[#C08C6C]" />}
                                            </div>
                                        ))}
                                    </div>

                                    {/* New Address Form Fields */}
                                    <form onSubmit={handleAddAddress} className="space-y-4 pt-4 border-t border-[#F0F0E0]">
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

                            {/* + Add New Address Button (Only if not adding) */}
                            {(!showAddForm && addresses.length > 0) && (
                                <button onClick={() => setShowAddForm(true)} className="w-full py-3 border border-[#E5E0D8] rounded-xl text-[#5D5D5D] font-medium flex items-center justify-center gap-2 hover:bg-white transition-colors bg-white">
                                    <FaPlus className="text-xs" /> Add New Address
                                </button>
                            )}

                            {/* Proceed Button for Step 1 comes later */}
                        </div>
                    )}

                    {/* Collapse Header for Completed Step 1 */}
                    {activeStep > 1 && (
                        <div className="bg-white p-4 rounded-2xl border border-[#E5E0D8] flex justify-between items-center opacity-60">
                            <div>
                                <h3 className="font-serif text-lg text-[#2D2D2D]">Shipping Address</h3>
                                <p className="text-xs text-[#5D5D5D]">{addresses.find(a => a._id === selectedAddressId)?.address?.substring(0, 30)}...</p>
                            </div>
                            <button onClick={() => setActiveStep(1)} className="text-[#C08C6C] text-xs font-bold uppercase">Change</button>
                        </div>
                    )}

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
                                        className={`cursor-pointer p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${paymentMethod === 'Online' ? 'border-[#C08C6C] bg-[#C08C6C]/5' : 'border-[#F0F0E0] hover:border-[#E5E0D8]'}`}
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
