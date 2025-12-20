import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import cartService from '@/services/cartService';

interface CartItem {
    id: string | number;
    title: string;
    slug?: string;
    price: number;
    image: string;
    quantity: number;
    product?: string;
    variantId?: string;
    variantAttributes?: Record<string, string>;
}

interface CartState {
    cartItems: CartItem[];
    checkoutItems: CartItem[];
    isLoading: boolean;
    isError: boolean;
    message: string;
}

const initialState: CartState = {
    cartItems: [],
    checkoutItems: [],
    isLoading: false,
    isError: false,
    message: '',
};

// Helper check for Login
const isLoggedIn = () => {
    if (typeof window !== 'undefined') {
        const user = localStorage.getItem('user');
        return !!user;
    }
    return false;
};

// Load from local storage if guest
if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    if (!user) {
        const savedCart = localStorage.getItem('cartItems');
        if (savedCart) {
            initialState.cartItems = JSON.parse(savedCart);
        }
    }
}

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetchCart',
    async (_, thunkAPI) => {
        try {
            const response = await cartService.getCart();
            return response.data.data.map((item: any) => ({
                id: item.product._id || item.product,
                title: item.title,
                slug: item.product.slug,
                price: item.price,
                image: item.image || item.product.image || 'https://via.placeholder.com/150', // Fallback
                quantity: item.quantity,
                product: item.product._id || item.product,
                variantId: item.variantId,
                variantAttributes: item.variantAttributes
            }));
        } catch (error: any) {
            const message = error.response?.data?.error || error.message;
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const addItem = createAsyncThunk(
    'cart/addItem',
    async (item: CartItem, thunkAPI) => {
        if (!isLoggedIn()) {
            return item;
        }
        try {
            const payload = {
                product: item.id,
                quantity: 1,
                title: item.title,
                slug: item.slug,
                price: item.price,
                image: item.image,
                variantId: item.variantId,
                variantAttributes: item.variantAttributes
            };
            const response = await cartService.addToCart(payload);
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.response?.data?.error || error.message);
        }
    }
);

export const removeItem = createAsyncThunk(
    'cart/removeItem',
    async (payload: { id: string | number, variantId?: string } | string | number, thunkAPI) => {
        // Normalize payload
        const id = typeof payload === 'object' ? payload.id : payload;
        const variantId = typeof payload === 'object' ? payload.variantId : undefined;

        if (!isLoggedIn()) {
            return { id, variantId };
        }
        try {
            const response = await cartService.removeFromCart(id.toString(), variantId);
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.toString());
        }
    }
);

export const updateQuantity = createAsyncThunk(
    'cart/updateQuantity',
    async ({ id, quantity, variantId }: { id: string | number, quantity: number, variantId?: string }, thunkAPI) => {
        if (!isLoggedIn()) {
            return { id, quantity, variantId };
        }
        try {
            const response = await cartService.updateCartItem(id.toString(), quantity, variantId);
            return response.data.data;
        } catch (error: any) {
            return thunkAPI.rejectWithValue(error.toString());
        }
    }
);


export const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        setCheckoutItems: (state, action: PayloadAction<CartItem[]>) => {
            state.checkoutItems = action.payload;
        },
        clearCart: (state) => {
            state.cartItems = [];
            localStorage.removeItem('cartItems');
        },
        resetCart: (state) => {
            state.cartItems = [];
            state.checkoutItems = [];
            state.isError = false;
            state.message = '';
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.isLoading = false;
                state.cartItems = action.payload;
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
            })

            .addCase(addItem.fulfilled, (state, action) => {
                if (isLoggedIn()) {
                    if (Array.isArray(action.payload)) {
                        state.cartItems = action.payload.map((item: any) => ({
                            id: item.product._id || item.product,
                            title: item.title,
                            slug: item.product.slug,
                            price: item.price,
                            image: item.image || 'https://via.placeholder.com/150',
                            quantity: item.quantity,
                            product: item.product._id || item.product,
                            variantId: item.variantId,
                            variantAttributes: item.variantAttributes
                        }));
                    }
                } else {
                    const item = action.payload as CartItem;
                    // Check for existing item with same ID AND VariantID
                    const itemIndex = state.cartItems.findIndex((i) =>
                        i.id === item.id && i.variantId === item.variantId
                    );

                    if (itemIndex >= 0) {
                        state.cartItems[itemIndex].quantity += 1;
                    } else {
                        state.cartItems.push({ ...item, quantity: 1 });
                    }
                    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                }
            })

            // Remove Item
            .addCase(removeItem.fulfilled, (state, action) => {
                if (isLoggedIn()) {
                    if (Array.isArray(action.payload)) {
                        state.cartItems = action.payload.map((item: any) => ({
                            id: item.product._id || item.product,
                            title: item.title,
                            slug: item.product.slug,
                            price: item.price,
                            image: item.image,
                            quantity: item.quantity,
                            product: item.product._id || item.product,
                            variantId: item.variantId,
                            variantAttributes: item.variantAttributes
                        }));
                    }
                } else {
                    const payload = action.payload as { id: string | number, variantId?: string };
                    const { id, variantId } = payload;

                    state.cartItems = state.cartItems.filter((i) => {
                        if (i.id === id) {
                            if (variantId) return i.variantId !== variantId;
                            // If no variantId specified, remove item only if it has no variantId? 
                            // Or remove all instances? Let's match strict equality.
                            return !!i.variantId; // Keep if it has variantId
                        }
                        return true;
                    });
                    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                }
            })

            // Update Quantity
            .addCase(updateQuantity.fulfilled, (state, action) => {
                if (isLoggedIn()) {
                    if (Array.isArray(action.payload)) {
                        state.cartItems = action.payload.map((item: any) => ({
                            id: item.product._id || item.product,
                            title: item.title,
                            slug: item.product.slug,
                            price: item.price,
                            image: item.image,
                            quantity: item.quantity,
                            product: item.product._id || item.product,
                            variantId: item.variantId,
                            variantAttributes: item.variantAttributes
                        }));
                    }
                } else {
                    const { id, quantity, variantId } = action.payload as { id: string | number, quantity: number, variantId?: string };

                    const itemIndex = state.cartItems.findIndex((i) =>
                        i.id === id && i.variantId === variantId
                    );

                    if (itemIndex >= 0) {
                        state.cartItems[itemIndex].quantity = quantity;
                        if (state.cartItems[itemIndex].quantity <= 0) {
                            state.cartItems.splice(itemIndex, 1);
                        }
                    }
                    localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
                }
            });
    },
});

export const { clearCart, setCheckoutItems, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
