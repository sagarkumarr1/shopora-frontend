import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import addressReducer from './addressSlice';
import productReducer from './productSlice';
import categoryReducer from './categorySlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        address: addressReducer,
        product: productReducer,
        category: categoryReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
