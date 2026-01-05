/**
 * Application Hooks
 * React Query hooks for mission application operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { applicationService } from "../services/applicationService";
import { missionKeys } from "./useMissions";
import type {
    MissionApplication,
    ApplicationFilters,
    CreateApplicationInput,
} from "@/types/application.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const applicationKeys = {
    all: ["applications"] as const,
    lists: () => [...applicationKeys.all, "list"] as const,
    my: (filters?: ApplicationFilters) => [...applicationKeys.all, "my", filters] as const,
    mission: (missionId: number, filters?: ApplicationFilters) =>
        [...applicationKeys.all, "mission", missionId, filters] as const,
    details: () => [...applicationKeys.all, "detail"] as const,
    detail: (id: number) => [...applicationKeys.details(), id] as const,
};

/**
 * Hook to get worker's own applications
 */
export function useMyApplications(filters?: ApplicationFilters) {
    return useQuery({
        queryKey: applicationKeys.my(filters),
        queryFn: async (): Promise<ApiResponse<MissionApplication[]>> => {
            return applicationService.getMyApplications(filters);
        },
    });
}

/**
 * Hook to get applications for a specific mission (institution)
 */
export function useMissionApplications(missionId: number, filters?: ApplicationFilters) {
    return useQuery({
        queryKey: applicationKeys.mission(missionId, filters),
        queryFn: async (): Promise<ApiResponse<MissionApplication[]>> => {
            return applicationService.getMissionApplications(missionId, filters);
        },
        enabled: !!missionId,
    });
}

/**
 * Hook to get a single application by ID
 */
export function useApplication(id: number) {
    return useQuery({
        queryKey: applicationKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<MissionApplication>> => {
            return applicationService.getById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to apply to a mission
 */
export function useApplyToMission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateApplicationInput): Promise<ApiResponse<MissionApplication>> => {
            return applicationService.apply(data);
        },
        onSuccess: (_, variables) => {
            // Invalidate my applications and mission-specific applications
            queryClient.invalidateQueries({ queryKey: applicationKeys.my() });
            queryClient.invalidateQueries({
                queryKey: applicationKeys.mission(variables.missionId),
            });
            // Also invalidate available missions to update "applied" status
            queryClient.invalidateQueries({ queryKey: missionKeys.available() });
        },
    });
}

/**
 * Hook to withdraw an application
 */
export function useWithdrawApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return applicationService.withdraw(id);
        },
        onSuccess: () => {
            // Invalidate application lists
            queryClient.invalidateQueries({ queryKey: applicationKeys.my() });
            queryClient.invalidateQueries({ queryKey: applicationKeys.lists() });
            // Also invalidate available missions
            queryClient.invalidateQueries({ queryKey: missionKeys.available() });
        },
    });
}

/**
 * Hook to accept an application (institution)
 */
export function useAcceptApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<MissionApplication>> => {
            return applicationService.accept(id);
        },
        onSuccess: () => {
            // Invalidate application lists - use exact query key patterns
            queryClient.invalidateQueries({ queryKey: applicationKeys.all });
            // Invalidate missions as status may change
            queryClient.invalidateQueries({ queryKey: missionKeys.all });
        },
    });
}

/**
 * Hook to reject an application (institution)
 */
export function useRejectApplication() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<MissionApplication>> => {
            return applicationService.reject(id);
        },
        onSuccess: () => {
            // Invalidate application lists - use exact query key patterns
            queryClient.invalidateQueries({ queryKey: applicationKeys.all });
        },
    });
}
