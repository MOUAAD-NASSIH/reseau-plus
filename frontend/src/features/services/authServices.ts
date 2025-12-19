import { toast } from "sonner";
import { api } from "@/api/axios";
import axios from "axios";
import type {
    LoginRequest,
    RegisterWorkerRequest,
    RegisterInstitutionRequest,
    AuthResponse,
} from "@/types/authTypes";

export const authService = {
    // Login
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        try {
            const response = await api.post<AuthResponse>("/auth/login", data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message)
                throw new Error(error.response?.data?.message || "Customer registration failed");
            }
            toast.error("Unknown error during customer registration")
            throw new Error("Unknown error during customer registration");
        }
    },

    // Register Worker
    registerWorker: async (data: RegisterWorkerRequest) => {
        try {
            const response = await api.post<AuthResponse>("/auth/register/worker", data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message)
                throw new Error(error.response?.data?.message || "Customer registration failed");
            }
            toast.error("Unknown error during customer registration")
            throw new Error("Unknown error during customer registration");
        }
    },

    // Register Institution
    registerInstitution: async (data: RegisterInstitutionRequest) => {
        try {
            const response = await api.post<AuthResponse>("/auth/register/institution", data);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message)
                throw new Error(error.response?.data?.message || "Customer registration failed");
            }
            toast.error("Unknown error during customer registration")
            throw new Error("Unknown error during customer registration");
        }
    },

    // Get Current User (Me)
    getMe: async () => {
        try {
            const response = await api.get<AuthResponse>("/auth/me");
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.message)
                throw new Error(error.response?.data?.message || "Customer registration failed");
            }
            toast.error("Unknown error during customer registration")
            throw new Error("Unknown error during customer registration");
        }
    },
};
