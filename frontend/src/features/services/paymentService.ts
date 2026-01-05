/**
 * Payment Service
 * API service for payment operations including Stripe integration
 */

import { api } from "@/api/axios";
import type { ApiResponse } from "@/types/api.types";
import type {
    Payment,
    CreatePaymentIntentInput,
    PaymentFeeCalculation,
    PaymentFilters,
    PaymentIntentResponse,
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

export const paymentService = {
    /**
     * Create a payment intent (institution only)
     */
    createPaymentIntent: async (
        data: CreatePaymentIntentInput
    ): Promise<ApiResponse<PaymentIntentResponse>> => {
        const response = await api.post<ApiResponse<PaymentIntentResponse>>(
            "/payments/create-intent",
            data
        );
        return response.data;
    },

    /**
     * Get payment history (filtered by role)
     */
    getPaymentHistory: async (filters?: PaymentFilters): Promise<ApiResponse<Payment[]>> => {
        const response = await api.get<ApiResponse<Payment[]>>(
            `/payments${buildQueryString(filters)}`
        );
        return response.data;
    },

    /**
     * Get payment by ID
     */
    getById: async (id: number): Promise<ApiResponse<Payment>> => {
        const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
        return response.data;
    },

    /**
     * Calculate payment fees
     */
    calculateFees: async (amount: number): Promise<ApiResponse<PaymentFeeCalculation>> => {
        const response = await api.post<ApiResponse<PaymentFeeCalculation>>(
            "/payments/calculate-fees",
            { amount }
        );
        return response.data;
    },

    /**
     * Get payment summary (admin only)
     */
    getSummary: async (): Promise<ApiResponse<Record<string, unknown>>> => {
        const response = await api.get<ApiResponse<Record<string, unknown>>>("/payments/summary");
        return response.data;
    },
};
