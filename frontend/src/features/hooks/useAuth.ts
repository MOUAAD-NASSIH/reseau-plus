/**
 * Auth Hooks
 * React Query hooks for authentication operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { authService } from "../services/authServices";
import { logout as logoutAction } from "../slices/authSlice";
import type { LoginRequest, MeResponse, AuthResponse } from "@/types/auth.types";

// Query keys
export const authKeys = {
    all: ["auth"] as const,
    me: () => [...authKeys.all, "me"] as const,
};

/**
 * Hook to get current authenticated user
 * Uses React Query for caching and automatic refetching
 */
export function useCurrentUser() {
    return useQuery({
        queryKey: authKeys.me(),
        queryFn: async (): Promise<MeResponse> => {
            return authService.getMe();
        },
        enabled: !!localStorage.getItem("auth_token"),
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook for login mutation
 * Handles token storage and navigation after successful login
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: LoginRequest): Promise<AuthResponse> => {
            return authService.login(data);
        },
        onSuccess: (response) => {
            // Store token
            localStorage.setItem("auth_token", response.data.token);

            // Invalidate and refetch user data
            queryClient.invalidateQueries({ queryKey: authKeys.me() });

            // Navigate based on role
            const role = response.data.user.role;
            if (role === "admin") {
                navigate("/admin");
            } else if (role === "institution") {
                navigate("/institution");
            } else if (role === "worker") {
                navigate("/worker");
            } else {
                navigate("/");
            }
        },
    });
}

/**
 * Hook for logout
 * Clears token, cache, and redirects to login
 */
export function useLogout() {
    const queryClient = useQueryClient();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (): Promise<void> => {
            // Clear token from localStorage
            localStorage.removeItem("auth_token");
        },
        onSuccess: () => {
            // Dispatch Redux logout action
            dispatch(logoutAction());

            // Clear all cached queries
            queryClient.clear();

            // Navigate to login
            navigate("/login");
        },
    });
}
