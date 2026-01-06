import { axiosInstance } from "@/lib/axios";
import type {
    LoginRequest,
    RegisterWorkerRequest,
    RegisterInstitutionRequest,
    AuthResponse,
    MeResponse,
} from "@/types/auth.types";
import { createWorkerRegistrationFormData } from "@/lib/helpers";

// Types for password reset
interface ForgotPasswordRequest {
    email: string;
}

interface ResetPasswordRequest {
    password: string;
}

interface ApiMessageResponse {
    success: boolean;
    message: string;
}

export const authService = {
    // Login
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    // Register Worker
    registerWorker: async (
        data: RegisterWorkerRequest,
        files?: File[]
    ): Promise<AuthResponse> => {
        // Convert to FormData if files are provided, otherwise send as JSON
        const payload = files && files.length > 0
            ? createWorkerRegistrationFormData(data, files)
            : data;

        const response = await axiosInstance.post<AuthResponse>(
            "/auth/register/worker",
            payload,
            {
                headers: files && files.length > 0
                    ? { 'Content-Type': 'multipart/form-data' }
                    : undefined,
            }
        );
        return response.data;
    },

    // Register Institution
    registerInstitution: async (
        data: RegisterInstitutionRequest
    ): Promise<AuthResponse> => {
        const response = await axiosInstance.post<AuthResponse>(
            "/auth/register/institution",
            data
        );
        return response.data;
    },

    // Get Current User
    getMe: async (): Promise<MeResponse> => {
        const response = await axiosInstance.get<MeResponse>("/auth/me");
        return response.data;
    },

    // Forgot Password - Request password reset email
    forgotPassword: async (data: ForgotPasswordRequest): Promise<ApiMessageResponse> => {
        const response = await axiosInstance.post<ApiMessageResponse>("/auth/forgot-password", data);
        return response.data;
    },

    // Reset Password - Set new password with token
    resetPassword: async (token: string, data: ResetPasswordRequest): Promise<ApiMessageResponse> => {
        const response = await axiosInstance.post<ApiMessageResponse>(`/auth/reset-password?token=${token}`, data);
        return response.data;
    },
};

