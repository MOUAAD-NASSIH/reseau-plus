/**
 * Payment Service
 * API service for payment operations including Stripe integration
 */

import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    Payment,
    CreatePaymentIntentInput,
    PaymentFeeCalculation,
    PaymentFilters,
} from "@/types/payment.types";

/**
 * Build query string from filters
 */
const buildQueryString = (filters?: PaymentFilters): string => {
    if (!filters) return "";
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    });
    const queryString = params.toString();
    return queryString ? `?${queryString}` : "";
};

/**
 * Payment intent response from Stripe
 */
interface PaymentIntentResponse {
    clientSecret: string;
    paymentId: number;
}

export const paymentService = {
    /**
     * Create a payment intent (institution only)
     */
    createPaymentIntent: async (
        data: CreatePaymentIntentInput
    ): Promise<ApiResponse<PaymentIntentResponse>> => {
        try {
            const response = await api.post<ApiResponse<PaymentIntentResponse>>(
                "/payments/create-intent",
                data
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to create payment intent";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error creating payment intent");
            throw new Error("Unknown error creating payment intent");
        }
    },

    /**
     * Get payment history (filtered by role)
     */
    getPaymentHistory: async (filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> => {
        try {
            const response = await api.get<ApiResponse<Payment[]>>(
                `/payments${buildQueryString(filters)}`
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch payment history";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching payment history");
            throw new Error("Unknown error fetching payment history");
        }
    },

    /**
     * Get payment by ID
     */
    getById: async (id: number): Promise<ApiResponse<Payment>> => {
        try {
            const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch payment";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching payment");
            throw new Error("Unknown error fetching payment");
        }
    },

    /**
     * Calculate payment fees
     */
    calculateFees: async (amount: number): Promise<ApiResponse<PaymentFeeCalculation>> => {
        try {
            const response = await api.post<ApiResponse<PaymentFeeCalculation>>(
                "/payments/calculate-fees",
                { amount }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to calculate fees";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error calculating fees");
            throw new Error("Unknown error calculating fees");
        }
    },

    /**
     * Get payment summary (admin only)
     */
    getSummary: async (): Promise<ApiResponse<Record<string, unknown>>> => {
        try {
            const response = await api.get<ApiResponse<Record<string, unknown>>>("/payments/summary");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                const message = error.response?.data?.message || "Failed to fetch payment summary";
                toast.error(message);
                throw new Error(message);
            }
            toast.error("Unknown error fetching payment summary");
            throw new Error("Unknown error fetching payment summary");
        }
    },
};
