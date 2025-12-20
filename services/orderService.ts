import axios from './axiosInstance';

// Create new order
const createOrder = async (orderData: any) => {
    const response = await axios.post('orders/', orderData);
    return response.data;
};

// Get user orders
const getMyOrders = async () => {
    const response = await axios.get('orders/myorders');
    return response.data;
};

// Get order by ID
const getOrderById = async (id: string) => {
    const response = await axios.get('orders/' + id);
    return response.data;
};

// Admin: Get all orders
const getAllOrders = async () => {
    const response = await axios.get('orders/');
    return response.data;
};

// Admin: Update order status
const updateOrderStatus = async (id: string, status: string, tracking?: any, estimatedDeliveryDate?: string) => {
    const payload: any = { status };
    if (tracking) payload.tracking = tracking;
    if (estimatedDeliveryDate) payload.estimatedDeliveryDate = estimatedDeliveryDate;
    const response = await axios.put(`orders/${id}/status`, payload);
    return response.data;
};

// User: Cancel order
const cancelOrder = async (id: string) => {
    const response = await axios.put(`orders/${id}/cancel`);
    return response.data;
};

const orderService = {
    createOrder,
    getMyOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus,
    cancelOrder
};

export default orderService;
