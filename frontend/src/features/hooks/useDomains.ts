/**
 * Domain and Speciality Hooks
 * React Query hooks for domain and speciality operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    domainService,
    type CreateDomainInput,
    type UpdateDomainInput,
    type CreateSpecialityInput,
    type UpdateSpecialityInput,
} from "../services/domainService";
import type { Domain, Speciality, DomainFilters, SpecialityFilters } from "@/types/auth.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const domainKeys = {
    all: ["domains"] as const,
    lists: () => [...domainKeys.all, "list"] as const,
    list: (filters?: DomainFilters) => [...domainKeys.lists(), filters] as const,
    details: () => [...domainKeys.all, "detail"] as const,
    detail: (id: number) => [...domainKeys.details(), id] as const,
};

export const specialityKeys = {
    all: ["specialities"] as const,
    lists: () => [...specialityKeys.all, "list"] as const,
    list: (filters?: SpecialityFilters) => [...specialityKeys.lists(), filters] as const,
    details: () => [...specialityKeys.all, "detail"] as const,
    detail: (id: number) => [...specialityKeys.details(), id] as const,
};

// ============================================
// DOMAIN HOOKS
// ============================================

/**
 * Hook to get all domains
 */
export function useDomains(filters?: DomainFilters) {
    return useQuery({
        queryKey: domainKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Domain[]>> => {
            return domainService.getDomains(filters);
        },
    });
}

/**
 * Hook to get a single domain by ID
 */
export function useDomain(id: number) {
    return useQuery({
        queryKey: domainKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<Domain>> => {
            return domainService.getDomainById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to create a new domain (admin)
 */
export function useCreateDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateDomainInput): Promise<ApiResponse<Domain>> => {
            return domainService.createDomain(data);
        },
        onSuccess: () => {
            // Invalidate domain lists
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
    });
}

/**
 * Hook to update a domain (admin)
 */
export function useUpdateDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: UpdateDomainInput;
        }): Promise<ApiResponse<Domain>> => {
            return domainService.updateDomain(id, data);
        },
        onSuccess: (_, variables) => {
            // Invalidate specific domain and lists
            queryClient.invalidateQueries({ queryKey: domainKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
    });
}

/**
 * Hook to delete a domain (admin)
 */
export function useDeleteDomain() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return domainService.deleteDomain(id);
        },
        onSuccess: () => {
            // Invalidate domain lists
            queryClient.invalidateQueries({ queryKey: domainKeys.lists() });
        },
    });
}

// ============================================
// SPECIALITY HOOKS
// ============================================

/**
 * Hook to get all specialities
 */
export function useSpecialities(filters?: SpecialityFilters) {
    return useQuery({
        queryKey: specialityKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Speciality[]>> => {
            return domainService.getSpecialities(filters);
        },
    });
}

/**
 * Hook to get a single speciality by ID
 */
export function useSpeciality(id: number) {
    return useQuery({
        queryKey: specialityKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<Speciality>> => {
            return domainService.getSpecialityById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to create a new speciality (admin)
 */
export function useCreateSpeciality() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateSpecialityInput): Promise<ApiResponse<Speciality>> => {
            return domainService.createSpeciality(data);
        },
        onSuccess: () => {
            // Invalidate speciality lists
            queryClient.invalidateQueries({ queryKey: specialityKeys.lists() });
        },
    });
}

/**
 * Hook to update a speciality (admin)
 */
export function useUpdateSpeciality() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: UpdateSpecialityInput;
        }): Promise<ApiResponse<Speciality>> => {
            return domainService.updateSpeciality(id, data);
        },
        onSuccess: (_, variables) => {
            // Invalidate specific speciality and lists
            queryClient.invalidateQueries({ queryKey: specialityKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: specialityKeys.lists() });
        },
    });
}

/**
 * Hook to delete a speciality (admin)
 */
export function useDeleteSpeciality() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return domainService.deleteSpeciality(id);
        },
        onSuccess: () => {
            // Invalidate speciality lists
            queryClient.invalidateQueries({ queryKey: specialityKeys.lists() });
        },
    });
}
