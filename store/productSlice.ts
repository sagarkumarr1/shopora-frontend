import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import productService from '../services/productService';

interface Product {
    _id: string;
    title: string;
    description: string;
    price: number;
    discount: string;
    category: string;
    image: string;
    images?: string[];
    stock: number;
}

interface ProductState {
    products: Product[];
    product: Product | null;
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
}

const initialState: ProductState = {
    products: [],
    product: null,
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get all products
export const getProducts = createAsyncThunk(
    'products/getAll',
    async (keyword: string | undefined, thunkAPI: any) => {
        try {
            return await productService.getProducts(keyword);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete product
export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id: string, thunkAPI: any) => {
        try {
            await productService.deleteProduct(id);
            return id;
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create product
export const createProduct = createAsyncThunk(
    'products/create',
    async (productData: any, thunkAPI: any) => {
        try {
            return await productService.createProduct(productData);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        reset: (state) => {
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getProducts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getProducts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.products = action.payload.data;
            })
            .addCase(getProducts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.products = state.products.filter(p => p._id !== action.payload);
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.products.push(action.payload.data);
            });
    },
});

export const { reset } = productSlice.actions;
export default productSlice.reducer;
