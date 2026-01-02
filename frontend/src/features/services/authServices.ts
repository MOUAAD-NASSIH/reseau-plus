import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
import type {
    LoginRequest,
    RegisterWorkerRequest,
    RegisterInstitutionRequest,
    AuthResponse,
    MeResponse,
} from "@/types/auth.types";
import { createWorkerRegistrationFormData } from "@/lib/helpers";

export const authService = {
    // Login
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>("/auth/login", data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Login failed");
                throw new Error(error.response?.data?.message || "Login failed");
            }
            toast.error("Unknown error during login");
            throw new Error("Unknown error during login");
        }
    },

    // Register Worker
    registerWorker: async (
        data: RegisterWorkerRequest,
        files?: File[]
    ): Promise<AuthResponse> => {
        try {
            // Convert to FormData if files are provided, otherwise send as JSON
            const payload = files && files.length > 0
                ? createWorkerRegistrationFormData(data, files)
                : data;

            const response = await api.post<AuthResponse>(
                "/auth/register/worker",
                payload,
                {
                    headers: files && files.length > 0
                        ? { 'Content-Type': 'multipart/form-data' }
                        : undefined,
                }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Worker registration failed");
                throw new Error(error.response?.data?.message || "Worker registration failed");
            }
            toast.error("Unknown error during worker registration");
            throw new Error("Unknown error during worker registration");
        }
    },

    // Register Institution
    registerInstitution: async (
        data: RegisterInstitutionRequest
    ): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>(
                "/auth/register/institution",
                data
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Institution registration failed");
                throw new Error(error.response?.data?.message || "Institution registration failed");
            }
            toast.error("Unknown error during institution registration");
            throw new Error("Unknown error during institution registration");
        }
    },

    // Get Current User
    getMe: async (): Promise<MeResponse> => {
        try {
            const response = await api.get<MeResponse>("/auth/me");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message || "Failed to fetch user");
                throw new Error(error.response?.data?.message || "Failed to fetch user");
            }
            toast.error("Unknown error fetching user");
            throw new Error("Unknown error fetching user");
        }
    },
};
