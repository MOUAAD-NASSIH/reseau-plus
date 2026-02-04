/**
 * Application Endpoints Module
 * RTK Query endpoints for mission application operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    MissionApplication,
    CreateApplicationInput,
    ApplicationFilters,
} from "@/types/application.types";

/**
 * Build query params object from filters
 */
const buildParams = (filters?: ApplicationFilters): Record<string, string> | undefined => {
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
 * Application API endpoints injected into the main API slice
 */
export const applicationApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get worker's own applications
         */
        getMyApplications: builder.query<ApiResponse<MissionApplication[]>, ApplicationFilters | void>({
            query: (filters) => ({
                url: "/applications/my",
                params: buildParams(filters || undefined),
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Applications" as const,
                            id,
                        })),
                        { type: "Applications", id: "MY_LIST" },
                    ]
                    : [{ type: "Applications", id: "MY_LIST" }],
        }),

        /**
         * Get applications for a specific mission (institution only)
         */
        getMissionApplications: builder.query<
            ApiResponse<MissionApplication[]>,
            { missionId: number; filters?: ApplicationFilters }
        >({
            query: ({ missionId, filters }) => ({
                url: `/applications/mission/${missionId}`,
                params: buildParams(filters),
            }),
            providesTags: (result, _, { missionId }) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Applications" as const,
                            id,
                        })),
                        { type: "Applications", id: `MISSION_${missionId}` },
                        { type: "Applications", id: "LIST" },
                    ]
                    : [
                        { type: "Applications", id: `MISSION_${missionId}` },
                        { type: "Applications", id: "LIST" },
                    ],
        }),

        /**
         * Get a single application by ID
         */
        getApplication: builder.query<ApiResponse<MissionApplication>, number>({
            query: (id) => ({ url: `/applications/${id}` }),
            providesTags: (_, __, id) => [{ type: "Applications", id }],
        }),

        /**
         * Apply to a mission (worker only)
         * Invalidates application lists and available missions
         */
        applyToMission: builder.mutation<ApiResponse<MissionApplication>, CreateApplicationInput>({
            query: (data) => ({
                url: "/applications",
                method: "POST",
                data,
            }),
            invalidatesTags: (_, __, { missionId }) => [
                { type: "Applications", id: "MY_LIST" },
                { type: "Applications", id: `MISSION_${missionId}` },
                { type: "Applications", id: "LIST" },
                { type: "Applications" },
                { type: "Missions", id: "AVAILABLE_LIST" },
                { type: "Missions", id: missionId },
            ],
        }),

        /**
         * Withdraw an application (worker only)
         * Invalidates application and mission caches
         */
        withdrawApplication: builder.mutation<ApiResponse<void>, { id: number; missionId: number }>({
            query: ({ id }) => ({
                url: `/applications/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_, __, { id, missionId }) => [
                { type: "Applications", id },
                { type: "Applications", id: "MY_LIST" },
                { type: "Applications", id: `MISSION_${missionId}` },
                { type: "Applications", id: "LIST" },
                { type: "Applications" },
                { type: "Missions", id: "AVAILABLE_LIST" },
                { type: "Missions", id: missionId },
            ],
        }),

        /**
         * Accept an application (institution only)
         * Invalidates applications, missions, and assignments caches
         */
        acceptApplication: builder.mutation<
            ApiResponse<MissionApplication>,
            { id: number; missionId: number }
        >({
            query: ({ id }) => ({
                url: `/applications/${id}/accept`,
                method: "PUT",
            }),
            invalidatesTags: (_, __, { id, missionId }) => [
                { type: "Applications", id },
                { type: "Applications", id: "MY_LIST" },
                { type: "Applications", id: `MISSION_${missionId}` },
                { type: "Applications", id: "LIST" },
                { type: "Missions", id: "LIST" },
                { type: "Missions", id: "MY_LIST" },
                { type: "Missions", id: "AVAILABLE_LIST" },
                { type: "Missions", id: missionId },
                { type: "Assignments", id: "LIST" },
                { type: "Assignments", id: "MY_LIST" },
                { type: "Assignments", id: "INSTITUTION_LIST" },
            ],
        }),

        /**
         * Reject an application (institution only)
         * Invalidates application caches
         */
        rejectApplication: builder.mutation<
            ApiResponse<MissionApplication>,
            { id: number; missionId: number }
        >({
            query: ({ id }) => ({
                url: `/applications/${id}/reject`,
                method: "PUT",
            }),
            invalidatesTags: (_, __, { id, missionId }) => [
                { type: "Applications", id },
                { type: "Applications", id: "MY_LIST" },
                { type: "Applications", id: `MISSION_${missionId}` },
                { type: "Applications", id: "LIST" },
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for application endpoints
 * Export for use in components
 */
export const {
    useGetMyApplicationsQuery,
    useGetMissionApplicationsQuery,
    useGetApplicationQuery,
    useApplyToMissionMutation,
    useWithdrawApplicationMutation,
    useAcceptApplicationMutation,
    useRejectApplicationMutation,
} = applicationApi;

