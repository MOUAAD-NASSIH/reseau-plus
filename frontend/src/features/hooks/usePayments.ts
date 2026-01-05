/**
 * Payment Hooks
 * React Query hooks for payment operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "../services/paymentService";
import { assignmentKeys } from "./useAssignments";
import type {
    Payment,
    PaymentFilters,
    CreatePaymentIntentInput,
    PaymentIntentResponse,
} from "@/types/payment.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const paymentKeys = {
    all: ["payments"] as const,
    lists: () => [...paymentKeys.all, "list"] as const,
    list: (filters?: PaymentFilters) => [...paymentKeys.lists(), filters] as const,
    summary: () => [...paymentKeys.all, "summary"] as const,
    details: () => [...paymentKeys.all, "detail"] as const,
    detail: (id: number) => [...paymentKeys.details(), id] as const,
};

/**
 * Hook to get payment history
 */
export function usePayments(filters?: PaymentFilters) {
    return useQuery({
        queryKey: paymentKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Payment[]>> => {
            return paymentService.getPaymentHistory(filters);
        },
    });
}

/**
 * Hook to get a single payment by ID
 */
export function usePayment(id: number) {
    return useQuery({
        queryKey: paymentKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<Payment>> => {
            return paymentService.getById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to get payment summary (admin)
 */
export function usePaymentSummary() {
    return useQuery({
        queryKey: paymentKeys.summary(),
        queryFn: async (): Promise<ApiResponse<Record<string, unknown>>> => {
            return paymentService.getSummary();
        },
    });
}

/**
 * Hook to create a payment intent
 */
export function useCreatePaymentIntent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (
            data: CreatePaymentIntentInput
        ): Promise<ApiResponse<PaymentIntentResponse>> => {
            return paymentService.createPaymentIntent(data);
        },
        onSuccess: () => {
            // Invalidate payment lists
            queryClient.invalidateQueries({ queryKey: paymentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: paymentKeys.summary() });
            // Also invalidate assignments as payment status may affect them
            queryClient.invalidateQueries({ queryKey: assignmentKeys.all });
        },
    });
}

/**
 * Hook to calculate payment fees
 */
export function useCalculateFees() {
    return useMutation({
        mutationFn: async (amount: number) => {
            return paymentService.calculateFees(amount);
        },
    });
}
