/**
 * Assignment Endpoints Module
 * RTK Query endpoints for mission assignment operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    MissionAssignment,
    AssignmentFilters,
    AssignmentStatus,
} from "@/types/assignment.types";

/**
 * Build query params object from filters
 */
const buildParams = (filters?: AssignmentFilters): Record<string, string> | undefined => {
    if (!filters) return undefined;
    const params: Record<string, string> = {};
    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            params[key] = String(value);
        }
    });
    return Object.keys(params).length > 0 ? params : undefined;
};

/**
 * Assignment API endpoints injected into the main API slice
 */
export const assignmentApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get worker's own assignments
         * Provides tags for cache identification
         */
        getMyAssignments: builder.query<ApiResponse<MissionAssignment[]>, AssignmentFilters | void>({
            query: (filters) => ({
                url: "/assignments/my",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Assignments" as const,
                            id,
                        })),
                        { type: "Assignments", id: "MY_LIST" },
                    ]
                    : [{ type: "Assignments", id: "MY_LIST" }],
        }),

        /**
         * Get institution's assignments
         * Provides tags for cache identification
         */
        getInstitutionAssignments: builder.query<ApiResponse<MissionAssignment[]>, AssignmentFilters | void>({
            query: (filters) => ({
                url: "/assignments/institution",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Assignments" as const,
                            id,
                        })),
                        { type: "Assignments", id: "INSTITUTION_LIST" },
                    ]
                    : [{ type: "Assignments", id: "INSTITUTION_LIST" }],
        }),

        /**
         * Get all assignments (admin only)
         * Provides tags for cache identification
         */
        getAllAssignments: builder.query<ApiResponse<MissionAssignment[]>, AssignmentFilters | void>({
            query: (filters) => ({
                url: "/assignments",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Assignments" as const,
                            id,
                        })),
                        { type: "Assignments", id: "LIST" },
                    ]
                    : [{ type: "Assignments", id: "LIST" }],
        }),

        /**
         * Get a single assignment by ID
         */
        getAssignment: builder.query<ApiResponse<MissionAssignment>, number>({
            query: (id) => ({ url: `/assignments/${id}` }),
            providesTags: (_, __, id) => [{ type: "Assignments", id }],
        }),

        /**
         * Update assignment status (institution/admin only)
         * Invalidates assignment lists and related mission caches
         */
        updateAssignmentStatus: builder.mutation<
            ApiResponse<MissionAssignment>,
            { id: number; status: AssignmentStatus }
        >({
            query: ({ id, status }) => ({
                url: `/assignments/${id}/status`,
                method: "PUT",
                data: { status },
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "Assignments", id },
                { type: "Assignments", id: "LIST" },
                { type: "Assignments", id: "MY_LIST" },
                { type: "Assignments", id: "INSTITUTION_LIST" },
                { type: "Missions", id: "LIST" },
                { type: "Missions", id: "MY_LIST" },
                { type: "Missions", id: "AVAILABLE_LIST" },
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for assignment endpoints
 * Export for use in components
 */
export const {
    useGetMyAssignmentsQuery,
    useGetInstitutionAssignmentsQuery,
    useGetAllAssignmentsQuery,
    useGetAssignmentQuery,
    useUpdateAssignmentStatusMutation,
} = assignmentApi;

