import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import addressService from '../services/addressService';

interface Address {
    _id: string;
    name: string;
    mobile: string;
    pincode: string;
    locality: string;
    address: string;
    city: string;
    state: string;
    isDefault: boolean;
}

interface AddressState {
    addresses: Address[];
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
}

const initialState: AddressState = {
    addresses: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get user addresses
export const getAddresses = createAsyncThunk(
    'address/getAll',
    async (_, thunkAPI: any) => {
        try {
            const token = thunkAPI.getState().auth.user.token; // Assuming token is here, or usually handled by cookie. 
            // Wait, standard auth uses HttpOnly cookie, but axios might need credentials: true. 
            // My backend uses HttpOnly cookie for auth check in middleware?
            // Step 48: Middleware checks `req.cookies.token`.
            // So I don't need to pass Bearer token if axios sends cookies.
            // But my `authService` did not set specific token in headers.
            // Let's check `authService`. It didn't send token.
            // Does axios send cookies by default? Need `withCredentials: true`.
            // Let's rely on that. But wait, in `addressService` I just wrote Bearer token logic.
            // I should fix `addressService` to optionally use cookie. 
            // The `authController` sends cookie.
            // The `middleware/auth.js` checks header OR cookie.
            // So if I set `withCredentials: true` in axios globally or per request, it works.

            // For now, let's assume we might need to handle this.
            // However, `authSlice` stores `user` but token is inside cookie.
            // `authController` sends token in body response too!
            // Step 47: `sendTokenResponse` sends json body `{ success: true, token, user: ... }`
            // But `authSlice` only stored `user` object in localStorage in Step 58?
            // Step 58: `localStorage.setItem('user', JSON.stringify(response.data.user));`
            // It DOES NOT store the token in localStorage. It relies on the HTTP-only cookie.
            // So `thunkAPI.getState().auth.user.token` will be undefined.

            // FIX: Use `withCredentials: true` to send the cookie.
            return await addressService.getAddresses();
        } catch (error: any) {
            const message =
                (error.response &&
                    error.response.data &&
                    error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const addAddress = createAsyncThunk(
    'address/add',
    async (addressData: any, thunkAPI: any) => {
        try {
            return await addressService.addAddress(addressData);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const deleteAddress = createAsyncThunk(
    'address/delete',
    async (id: string, thunkAPI: any) => {
        try {
            return await addressService.deleteAddress(id);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

export const addressSlice = createSlice({
    name: 'address',
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
            .addCase(getAddresses.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getAddresses.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.addresses = action.payload.data;
            })
            .addCase(getAddresses.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.addresses = action.payload.data;
            })
            .addCase(deleteAddress.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.addresses = action.payload.data;
            });
    },
});

export const { reset } = addressSlice.actions;
export default addressSlice.reducer;
