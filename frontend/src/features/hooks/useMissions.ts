/**
 * Mission Hooks
 * React Query hooks for mission operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { missionService } from "../services/missionService";
import type {
    Mission,
    MissionFilters,
    CreateMissionInput,
    UpdateMissionInput,
} from "@/types/mission.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const missionKeys = {
    all: ["missions"] as const,
    lists: () => [...missionKeys.all, "list"] as const,
    list: (filters?: MissionFilters) => [...missionKeys.lists(), filters] as const,
    available: (filters?: MissionFilters) => [...missionKeys.all, "available", filters] as const,
    my: (filters?: MissionFilters) => [...missionKeys.all, "my", filters] as const,
    recommended: () => [...missionKeys.all, "recommended"] as const,
    stats: () => [...missionKeys.all, "stats"] as const,
    details: () => [...missionKeys.all, "detail"] as const,
    detail: (id: number) => [...missionKeys.details(), id] as const,
};

/**
 * Hook to get available missions for workers
 */
export function useAvailableMissions(filters?: MissionFilters) {
    return useQuery({
        queryKey: missionKeys.available(filters),
        queryFn: async (): Promise<ApiResponse<Mission[]>> => {
            return missionService.getAvailable(filters);
        },
    });
}

/**
 * Hook to get a single mission by ID
 */
export function useMission(id: number) {
    return useQuery({
        queryKey: missionKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<Mission>> => {
            return missionService.getById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to get institution's own missions
 */
export function useMyMissions(filters?: MissionFilters) {
    return useQuery({
        queryKey: missionKeys.my(filters),
        queryFn: async (): Promise<ApiResponse<Mission[]>> => {
            return missionService.getMyMissions(filters);
        },
    });
}

/**
 * Hook to get all missions (admin)
 */
export function useAllMissions(filters?: MissionFilters) {
    return useQuery({
        queryKey: missionKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<Mission[]>> => {
            return missionService.getAll(filters);
        },
    });
}

/**
 * Hook to get recommended missions for workers
 */
export function useRecommendedMissions() {
    return useQuery({
        queryKey: missionKeys.recommended(),
        queryFn: async (): Promise<ApiResponse<Mission[]>> => {
            return missionService.getRecommended();
        },
    });
}

/**
 * Hook to get mission statistics
 */
export function useMissionStats() {
    return useQuery({
        queryKey: missionKeys.stats(),
        queryFn: async (): Promise<ApiResponse<Record<string, number>>> => {
            return missionService.getStats();
        },
    });
}

/**
 * Hook to create a new mission
 */
export function useCreateMission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateMissionInput): Promise<ApiResponse<Mission>> => {
            return missionService.create(data);
        },
        onSuccess: () => {
            // Invalidate mission lists to refetch
            queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: missionKeys.my() });
            queryClient.invalidateQueries({ queryKey: missionKeys.available() });
            queryClient.invalidateQueries({ queryKey: missionKeys.stats() });
        },
    });
}

/**
 * Hook to update a mission
 */
export function useUpdateMission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            data,
        }: {
            id: number;
            data: UpdateMissionInput;
        }): Promise<ApiResponse<Mission>> => {
            return missionService.update(id, data);
        },
        onSuccess: (_, variables) => {
            // Invalidate specific mission and lists
            queryClient.invalidateQueries({ queryKey: missionKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: missionKeys.my() });
            queryClient.invalidateQueries({ queryKey: missionKeys.available() });
        },
    });
}

/**
 * Hook to delete a mission
 */
export function useDeleteMission() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number): Promise<ApiResponse<void>> => {
            return missionService.delete(id);
        },
        onSuccess: () => {
            // Invalidate mission lists
            queryClient.invalidateQueries({ queryKey: missionKeys.lists() });
            queryClient.invalidateQueries({ queryKey: missionKeys.my() });
            queryClient.invalidateQueries({ queryKey: missionKeys.available() });
            queryClient.invalidateQueries({ queryKey: missionKeys.stats() });
        },
    });
}
