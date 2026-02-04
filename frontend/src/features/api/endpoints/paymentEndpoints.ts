/**
 * Payment Endpoints Module
 * RTK Query endpoints for payment operations including Stripe integration
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    Payment,
    PaymentFilters,
    CreatePaymentIntentInput,
    PaymentIntentResponse,
    PaymentFeeCalculation,
} from "@/types/payment.types";

/**
 * Payment summary response type
 */
export interface PaymentSummary {
    totalPayments: number;
    totalAmount: number;
    totalPlatformFees: number;
    totalWorkerAmount: number;
    pendingPayments: number;
    completedPayments: number;
    failedPayments: number;
}

/**
 * Build query params object from filters
 */
const buildParams = (filters?: PaymentFilters): Record<string, string> | undefined => {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params[key] = String(value);
        }
    });
    return Object.keys(params).length > 0 ? params : undefined;
};

/**
 * Payment API endpoints injected into the main API slice
 */
export const paymentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get payment history (filtered by role)
         * Provides tags for cache identification
         */
        getPayments: builder.query<ApiResponse<Payment[]>, PaymentFilters | void>({
            query: (filters) => ({
                url: "/payments",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result, _error, filters) => {
                const tags: Array<{ type: "Payments"; id: string | number }> = [];

                if (result?.data) {
                    result.data.forEach(({ id }) => {
                        tags.push({ type: "Payments", id });
                    });
                }

                // Add list tag
                tags.push({ type: "Payments", id: "LIST" });

                // Add assignment-specific tag if filtering by assignment
                if (filters && typeof filters === 'object' && 'missionAssignmentId' in filters) {
                    tags.push({ type: "Payments", id: `ASSIGNMENT_${filters.missionAssignmentId}` });
                }

                return tags;
            },
        }),

        /**
         * Get a single payment by ID
         */
        getPayment: builder.query<ApiResponse<Payment>, number>({
            query: (id) => ({ url: `/payments/${id}` }),
            providesTags: (_, __, id) => [{ type: "Payments", id }],
        }),

        /**
         * Get payment summary (admin only)
         * Provides tags for cache identification
         */
        getPaymentSummary: builder.query<ApiResponse<PaymentSummary>, void>({
            query: () => ({ url: "/payments/summary" }),
            providesTags: [{ type: "Payments", id: "SUMMARY" }],
        }),

        /**
         * Create a payment intent (institution only)
         * Invalidates payment and assignment caches
         */
        createPaymentIntent: builder.mutation<ApiResponse<PaymentIntentResponse>, CreatePaymentIntentInput>({
            query: (data) => ({
                url: "/payments/create-intent",
                method: "POST",
                data,
            }),
            invalidatesTags: (_result, _error, { assignmentId }) => [
                { type: "Payments", id: "LIST" },
                { type: "Payments", id: "SUMMARY" },
                { type: "Payments", id: `ASSIGNMENT_${assignmentId}` },
                { type: "Assignments", id: "LIST" },
                { type: "Assignments", id: "INSTITUTION_LIST" },
                { type: "Assignments", id: assignmentId },
            ],
        }),

        /**
         * Calculate payment fees
         * This is a query-like mutation (no cache invalidation needed)
         */
        calculateFees: builder.mutation<ApiResponse<PaymentFeeCalculation>, number>({
            query: (amount) => ({
                url: "/payments/calculate-fees",
                method: "POST",
                data: { amount },
            }),
        }),
    }),
});

/**
 * Auto-generated hooks for payment endpoints
 * Export for use in components
 */
export const {
    useGetPaymentsQuery,
    useGetPaymentQuery,
    useGetPaymentSummaryQuery,
    useCreatePaymentIntentMutation,
    useCalculateFeesMutation,
} = paymentApi;

