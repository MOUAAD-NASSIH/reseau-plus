/**
 * Custom base query for RTK Query that uses the generic Axios instance.
 */

import type { BaseQueryFn } from "@reduxjs/toolkit/query";
import type { AxiosRequestConfig, AxiosError } from "axios";
import { axiosInstance } from "@/lib/axios";

/**
 * Arguments for the Axios base query
 */
export interface AxiosBaseQueryArgs {
    url: string;
    method?: AxiosRequestConfig["method"];
    data?: AxiosRequestConfig["data"];
    params?: AxiosRequestConfig["params"];
    headers?: AxiosRequestConfig["headers"];
}

/**
 * Formats Axios errors for RTK Query.
 */
export interface AxiosBaseQueryError {
    status?: number;
    data?: {
        message?: string;
        error?: string;
        details?: Array<{ field: string; message: string }>;
    };
    message?: string;
}

/**
 * Custom base query that wraps the existing Axios instance
 * 
 * This preserves the auth interceptor behavior that:
 * - Injects JWT token from localStorage into Authorization header
 * - Stores tokens from response body into localStorage
 */
export const axiosBaseQuery: BaseQueryFn<
    AxiosBaseQueryArgs,
    unknown,
    AxiosBaseQueryError
> = async ({ url, method = "GET", data, params, headers }) => {
    try {
        const result = await axiosInstance({
            url,
            method,
            data,
            params,
            headers,
        });
        return { data: result.data };
    } catch (axiosError) {
        const err = axiosError as AxiosError<AxiosBaseQueryError["data"]>;
        return {
            error: {
                status: err.response?.status,
                data: err.response?.data,
                message: err.response?.data?.message || err.message,
            },
        };
    }
};

