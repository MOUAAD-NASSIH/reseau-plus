/**
 * Assignment Hooks
 * React Query hooks for mission assignment operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { assignmentService } from "../services/assignmentService";
import { missionKeys } from "./useMissions";
import type {
    MissionAssignment,
    AssignmentFilters,
    AssignmentStatus,
} from "@/types/assignment.types";
import type { ApiResponse } from "@/types/api.types";

// Query keys
export const assignmentKeys = {
    all: ["assignments"] as const,
    lists: () => [...assignmentKeys.all, "list"] as const,
    list: (filters?: AssignmentFilters) => [...assignmentKeys.lists(), filters] as const,
    my: (filters?: AssignmentFilters) => [...assignmentKeys.all, "my", filters] as const,
    institution: (filters?: AssignmentFilters) =>
        [...assignmentKeys.all, "institution", filters] as const,
    details: () => [...assignmentKeys.all, "detail"] as const,
    detail: (id: number) => [...assignmentKeys.details(), id] as const,
};

/**
 * Hook to get worker's own assignments
 */
export function useMyAssignments(filters?: AssignmentFilters) {
    return useQuery({
        queryKey: assignmentKeys.my(filters),
        queryFn: async (): Promise<ApiResponse<MissionAssignment[]>> => {
            return assignmentService.getMyAssignments(filters);
        },
    });
}

/**
 * Hook to get institution's assignments
 */
export function useInstitutionAssignments(filters?: AssignmentFilters) {
    return useQuery({
        queryKey: assignmentKeys.institution(filters),
        queryFn: async (): Promise<ApiResponse<MissionAssignment[]>> => {
            return assignmentService.getInstitutionAssignments(filters);
        },
    });
}

/**
 * Hook to get all assignments (admin)
 */
export function useAllAssignments(filters?: AssignmentFilters) {
    return useQuery({
        queryKey: assignmentKeys.list(filters),
        queryFn: async (): Promise<ApiResponse<MissionAssignment[]>> => {
            return assignmentService.getAll(filters);
        },
    });
}

/**
 * Hook to get a single assignment by ID
 */
export function useAssignment(id: number) {
    return useQuery({
        queryKey: assignmentKeys.detail(id),
        queryFn: async (): Promise<ApiResponse<MissionAssignment>> => {
            return assignmentService.getById(id);
        },
        enabled: !!id,
    });
}

/**
 * Hook to update assignment status
 */
export function useUpdateAssignmentStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            id,
            status,
        }: {
            id: number;
            status: AssignmentStatus;
        }): Promise<ApiResponse<MissionAssignment>> => {
            return assignmentService.updateStatus(id, status);
        },
        onSuccess: (_, variables) => {
            // Invalidate specific assignment and lists
            queryClient.invalidateQueries({ queryKey: assignmentKeys.detail(variables.id) });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.my() });
            queryClient.invalidateQueries({ queryKey: assignmentKeys.institution() });
            // Also invalidate missions as status may affect them
            queryClient.invalidateQueries({ queryKey: missionKeys.all });
        },
    });
}
