import axios from './axiosInstance';

const getCart = () => {
    return axios.get('cart');
};

const addToCart = (productData: any) => {
    return axios.post('cart', productData);
};

const updateCartItem = (itemId: string, quantity: number, variantId?: string) => {
    let url = `cart/${itemId}`;
    if (variantId) url += `?variantId=${variantId}`;
    return axios.put(url, { quantity });
};

const removeFromCart = (itemId: string, variantId?: string) => {
    let url = `cart/${itemId}`;
    if (variantId) url += `?variantId=${variantId}`;
    return axios.delete(url);
};

const cartService = {
    getCart,
    addToCart,
    updateCartItem,
    removeFromCart,
};

export default cartService;
