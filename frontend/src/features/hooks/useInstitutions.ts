/**
 * Institution Hooks
 * React Query hooks for institution profile operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { institutionService } from "../services/institutionService";
import type {
    Institution,
    UpdateInstitutionInput,
    InstitutionFilters,
} from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const institutionKeys = {
    all: ["institutions"] as const,
    lists: () => [...institutionKeys.all, "list"] as const,
    list: (filters?: InstitutionFilters) => [...institutionKeys.lists(), filters] as const,
    profile: () => [...institutionKeys.all, "profile"] as const,
    details: () => [...institutionKeys.all, "detail"] as const,
    detail: (id: number) => [...institutionKeys.details(), id] as const,
};

/**
 * Hook to get current institution's profile
 */
export function useInstitutionProfile() {
    return useQuery({
        queryKey: institutionKeys.profile(),
        queryFn: async (): Promise<ApiResponse<Institution>> => {
            return institutionService.getProfile();
        },
    });
}

/**
 * Hook to get an institution by ID
 */
export function useInstitution(id: number) {
    return useQuery({
        queryKey: institutionKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<Institution>> => {
            return institutionService.getById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to get all institutions (admin)
 */
export function useAllInstitutions(filters?: InstitutionFilters) {
    return useQuery({
        queryKey: institutionKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Institution[]>> => {
            return institutionService.getAll(filters);
        },
    });
}

/**
 * Hook to update institution profile
 */
export function useUpdateInstitutionProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: UpdateInstitutionInput): Promise<ApiResponse<Institution>> => {
            return institutionService.updateProfile(data);
        },
        onSuccess: () => {
            // Invalidate profile query
            queryClient.invalidateQueries({ queryKey: institutionKeys.profile() });
        },
    });
}
