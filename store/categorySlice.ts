import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import categoryService from '../services/categoryService';

interface Category {
    _id: string;
    name: string;
    image: string;
    slug: string;
}

interface CategoryState {
    categories: Category[];
    isError: boolean;
    isSuccess: boolean;
    isLoading: boolean;
    message: string;
}

const initialState: CategoryState = {
    categories: [],
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Get all categories
export const getCategories = createAsyncThunk(
    'categories/getAll',
    async (_, thunkAPI: any) => {
        try {
            return await categoryService.getCategories();
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Create category
export const createCategory = createAsyncThunk(
    'categories/create',
    async (categoryData: any, thunkAPI: any) => {
        try {
            return await categoryService.createCategory(categoryData);
        } catch (error: any) {
            const message =
                (error.response && error.response.data && error.response.data.error) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Delete category
export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id: string, thunkAPI: any) => {
        try {
            await categoryService.deleteCategory(id);
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


export const categorySlice = createSlice({
    name: 'category',
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
            .addCase(getCategories.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.categories = action.payload.data;
            })
            .addCase(getCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload as string;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.categories.push(action.payload.data);
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.categories = state.categories.filter(c => c._id !== action.payload);
            });
    },
});

export const { reset } = categorySlice.actions;
export default categorySlice.reducer;
