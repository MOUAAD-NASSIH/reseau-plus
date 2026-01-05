/**
 * Payment Slice
 * Redux state management for payments including Stripe integration
 */

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { paymentService } from "../services/paymentService";
import type { PaginationMeta } from "@/types/api.types";
import type {
    Payment,
    CreatePaymentIntentInput,
    PaymentFeeCalculation,
    PaymentFilters,
} from "@/types/payment.types";

// -------------------- STATE INTERFACE --------------------
export interface PaymentState {
    payments: Payment[];
    selectedPayment: Payment | null;
    currentPaymentIntent: {
        clientSecret: string;
        paymentIntentId: string;
        amount: number;
        platformFee: number;
        workerAmount: number;
        currency: string;
    } | null;
    feeCalculation: PaymentFeeCalculation | null;
    isLoading: boolean;
    error: string | null;
    pagination: PaginationMeta | null;
}

const initialState: PaymentState = {
    payments: [],
    selectedPayment: null,
    currentPaymentIntent: null,
    feeCalculation: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// -------------------- ASYNC THUNKS --------------------

// Create payment intent
export const createPaymentIntent = createAsyncThunk<
    { clientSecret: string; paymentIntentId: string; amount: number; platformFee: number; workerAmount: number; currency: string },
    CreatePaymentIntentInput,
    { rejectValue: string }
>("payments/createIntent", async (data, thunkAPI) => {
    try {
        const response = await paymentService.createPaymentIntent(data);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch payment history
export const fetchPaymentHistory = createAsyncThunk<
    { payments: Payment[]; pagination?: PaginationMeta },
    PaymentFilters | undefined,
    { rejectValue: string }
>("payments/fetchHistory", async (filters, thunkAPI) => {
    try {
        const response = await paymentService.getPaymentHistory(filters);
        return {
            payments: response.data || [],
            pagination: response.pagination,
        };
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Fetch payment by ID
export const fetchPaymentById = createAsyncThunk<
    Payment,
    number,
    { rejectValue: string }
>("payments/fetchById", async (id, thunkAPI) => {
    try {
        const response = await paymentService.getById(id);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// Calculate fees
export const calculatePaymentFees = createAsyncThunk<
    PaymentFeeCalculation,
    number,
    { rejectValue: string }
>("payments/calculateFees", async (amount, thunkAPI) => {
    try {
        const response = await paymentService.calculateFees(amount);
        return response.data!;
    } catch (error) {
        return thunkAPI.rejectWithValue((error as Error).message);
    }
});

// -------------------- SLICE --------------------
export const paymentSlice = createSlice({
    name: "payments",
    initialState,
    reducers: {
        clearSelectedPayment(state) {
            state.selectedPayment = null;
        },
        clearPaymentIntent(state) {
            state.currentPaymentIntent = null;
        },
        clearFeeCalculation(state) {
            state.feeCalculation = null;
        },
        clearPaymentError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // ---------- CREATE PAYMENT INTENT ----------
            .addCase(createPaymentIntent.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(createPaymentIntent.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentPaymentIntent = action.payload;
            })
            .addCase(createPaymentIntent.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to create payment intent";
            })

            // ---------- FETCH PAYMENT HISTORY ----------
            .addCase(fetchPaymentHistory.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.payments = action.payload.payments;
                state.pagination = action.payload.pagination || null;
            })
            .addCase(fetchPaymentHistory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch payment history";
            })

            // ---------- FETCH BY ID ----------
            .addCase(fetchPaymentById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchPaymentById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.selectedPayment = action.payload;
            })
            .addCase(fetchPaymentById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to fetch payment";
            })

            // ---------- CALCULATE FEES ----------
            .addCase(calculatePaymentFees.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(calculatePaymentFees.fulfilled, (state, action) => {
                state.isLoading = false;
                state.feeCalculation = action.payload;
            })
            .addCase(calculatePaymentFees.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload || "Failed to calculate fees";
            });
    },
});

export const {
    clearSelectedPayment,
    clearPaymentIntent,
    clearFeeCalculation,
    clearPaymentError,
} = paymentSlice.actions;
export default paymentSlice.reducer;
