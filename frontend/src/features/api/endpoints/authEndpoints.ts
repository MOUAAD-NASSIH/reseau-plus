/**
 * Auth Endpoints for RTK Query
 * 
 * Centralized authentication using RTK Query only.
 * No need for separate Redux slice - RTK Query handles all state management.
 */

import { api } from "../api";
import type {
    LoginRequest,
    RegisterWorkerRequest,
    RegisterInstitutionRequest,
    AuthResponse,
    MeResponse,
} from "@/types/auth.types";
import { createWorkerRegistrationFormData } from "@/lib/helpers";

export const authApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get current authenticated user
         * This is the single source of truth for user data
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
         */
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: "/auth/login",
                method: "POST",
                data: credentials,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    // Store token in localStorage
                    localStorage.setItem("auth_token", data.data.token);
                } catch {
                    // Silently handle error - token won't be stored
                }
            },
            // Invalidate Auth tag to trigger refetch of getCurrentUser
            invalidatesTags: ["Auth"],
        }),

        /**
         * Register Worker
         */
        registerWorker: builder.mutation<
            AuthResponse,
            { data: RegisterWorkerRequest; files?: File[] }
        >({
            query: ({ data, files }) => {
                const payload = files && files.length > 0
                    ? createWorkerRegistrationFormData(data, files)
                    : data;

                return {
                    url: "/auth/register/worker",
                    method: "POST",
                    data: payload,
                    headers: files && files.length > 0
                        ? { 'Content-Type': 'multipart/form-data' }
                        : undefined,
                };
            },
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    // Store token in localStorage
                    localStorage.setItem("auth_token", data.data.token);
                } catch {
                    // Silently handle error - token won't be stored
                }
            },
            invalidatesTags: ["Auth"],
        }),

        /**
         * Register Institution
         */
        registerInstitution: builder.mutation<AuthResponse, RegisterInstitutionRequest>({
            query: (data) => ({
                url: "/auth/register/institution",
                method: "POST",
                data,
            }),
            onQueryStarted: async (_, { queryFulfilled }) => {
                try {
                    const { data } = await queryFulfilled;
                    // Store token in localStorage
                    localStorage.setItem("auth_token", data.data.token);
                } catch {
                    // Silently handle error - token won't be stored
                }
            },
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
        }),

        /**
         * Update profile picture optimistically
         * This updates the cache immediately for instant UI feedback
         */
        updateProfilePicture: builder.mutation<{ url: string | null }, string | null>({
            queryFn: async (url) => {
                // This is just a cache update, no API call needed
                return { data: { url } };
            },
            onQueryStarted: async (url, { dispatch, queryFulfilled }) => {
                // Optimistically update the cache
                const patchResult = dispatch(
                    authApi.util.updateQueryData('getCurrentUser', undefined, (draft) => {
                        if (draft.data?.user) {
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            (draft.data.user as any).profilePicture = url;
                        }
                    })
                );

                try {
                    await queryFulfilled;
                } catch {
                    // Revert on error
                    patchResult.undo();
                }
            },
        }),

        /**
         * Forgot Password
         */
        forgotPassword: builder.mutation<{ success: boolean; message: string }, { email: string }>({
            query: (data) => ({
                url: "/auth/forgot-password",
                method: "POST",
                data,
            }),
        }),

        /**
         * Reset Password
         */
        resetPassword: builder.mutation<
            { success: boolean; message: string },
            { token: string; password: string }
        >({
            query: ({ token, password }) => ({
                url: `/auth/reset-password?token=${token}`,
                method: "POST",
                data: { password },
            }),
        }),
    }),
    overrideExisting: false,
});

export const {
    useGetCurrentUserQuery,
    useLoginMutation,
    useRegisterWorkerMutation,
    useRegisterInstitutionMutation,
    useLogoutMutation,
    useUpdateProfilePictureMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = authApi;
