/**
 * Auth Endpoints for RTK Query
 * 
 * Handles authentication operations including login, logout, and current user fetching.
 * Integrates with existing authSlice for UI state management.
 */

import { api } from "../api";
import type {
    LoginRequest,
    AuthResponse,
    MeResponse,
} from "@/types/auth.types";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get current authenticated user
         * Uses conditional fetching based on token presence
         */
        getCurrentUser: builder.query<MeResponse, void>({
            query: () => ({
                url: "/auth/me",
                method: "GET",
            }),
            providesTags: ["Auth"],
        }),

        /**
         * Login mutation
         * Stores token in localStorage on success
         */
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                data: credentials,
            }),
            // Invalidate Auth tag to trigger refetch of getCurrentUser
            invalidatesTags: ["Auth"],
        }),

        /**
         * Logout mutation
         * Clears token and resets entire RTK Query cache
         */
        logout: builder.mutation<void, void>({
            queryFn: async (_arg, { dispatch }) => {
                // Clear token from localStorage
                localStorage.removeItem("auth_token");

                // Reset entire RTK Query cache to clear all user data
                dispatch(api.util.resetApiState());

                return { data: undefined };
            },
            // No tags needed since we're resetting the entire cache
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetCurrentUserQuery,
    useLoginMutation,
    useLogoutMutation,
} = authApi;

