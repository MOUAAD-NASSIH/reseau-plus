/**
 * Mission Endpoints Module
 * RTK Query endpoints for mission-related operations
 *

 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    Mission,
    MissionFilters,
    CreateMissionInput,
    UpdateMissionInput,
} from "@/types/mission.types";

/**
 * Mission statistics response type
 */
export interface MissionStats {
    total: number;
    open: number;
    ongoing: number;
    closed: number;
    cancelled: number;
}

/**
 * Mission API endpoints injected into the main API slice
 */
export const missionApi = api.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * Get available missions for workers
         * Provides tags for cache identification
         */
        getAvailableMissions: builder.query<ApiResponse<Mission[]>, MissionFilters | void>({
            query: (filters) => ({
                url: "/missions/available",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Missions" as const,
                            id,
                        })),
                        { type: "Missions", id: "AVAILABLE_LIST" },
                    ]
                    : [{ type: "Missions", id: "AVAILABLE_LIST" }],
        }),

        /**
         * Get a single mission by ID
         */
        getMission: builder.query<ApiResponse<Mission>, number>({
            query: (id) => ({ url: `/missions/${id}` }),
            providesTags: (_, __, id) => [{ type: "Missions", id }],
        }),

        /**
         * Get institution's own missions
         */
        getMyMissions: builder.query<ApiResponse<Mission[]>, MissionFilters | void>({
            query: (filters) => ({
                url: "/missions/my",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Missions" as const,
                            id,
                        })),
                        { type: "Missions", id: "MY_LIST" },
                    ]
                    : [{ type: "Missions", id: "MY_LIST" }],
        }),

        /**
         * Get all missions (admin only)
         */
        getAllMissions: builder.query<ApiResponse<Mission[]>, MissionFilters | void>({
            query: (filters) => ({
                url: "/missions",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Missions" as const,
                            id,
                        })),
                        { type: "Missions", id: "LIST" },
                    ]
                    : [{ type: "Missions", id: "LIST" }],
        }),

        /**
         * Get recommended missions for workers
         */
        getRecommendedMissions: builder.query<ApiResponse<Mission[]>, void>({
            query: () => ({ url: "/missions/recommended" }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({
                            type: "Missions" as const,
                            id,
                        })),
                        { type: "Missions", id: "RECOMMENDED" },
                    ]
                    : [{ type: "Missions", id: "RECOMMENDED" }],
        }),

        /**
         * Get mission statistics for institution
         */
        getMissionStats: builder.query<ApiResponse<MissionStats>, void>({
            query: () => ({ url: "/missions/stats" }),
            providesTags: [{ type: "Missions", id: "STATS" }],
        }),

        /**
         * Create a new mission (institution only)
         * Invalidates all mission list caches
         */
        createMission: builder.mutation<ApiResponse<Mission>, CreateMissionInput>({
            query: (data) => ({
                url: "/missions",
                method: "POST",
                data,
            }),
            invalidatesTags: [
                { type: "Missions", id: "LIST" },
                { type: "Missions", id: "MY_LIST" },
                { type: "Missions", id: "AVAILABLE_LIST" },
                { type: "Missions", id: "RECOMMENDED" },
                { type: "Missions", id: "STATS" },
            ],
        }),

        /**
         * Update a mission (institution only)
         * Invalidates specific mission detail and all mission lists
         */
        updateMission: builder.mutation<
            ApiResponse<Mission>,
            { id: number; data: UpdateMissionInput }
        >({
            query: ({ id, data }) => ({
                url: `/missions/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "Missions", id },
                { type: "Missions", id: "LIST" },
                { type: "Missions", id: "MY_LIST" },
                { type: "Missions", id: "AVAILABLE_LIST" },
                { type: "Missions", id: "RECOMMENDED" },
            ],
        }),

        /**
         * Delete a mission (institution only)
         * Invalidates all mission-related caches
         */
        deleteMission: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/missions/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [
                { type: "Missions", id: "LIST" },
                { type: "Missions", id: "MY_LIST" },
                { type: "Missions", id: "AVAILABLE_LIST" },
                { type: "Missions", id: "RECOMMENDED" },
                { type: "Missions", id: "STATS" },
            ],
        }),
    }),
});

/**
 * Auto-generated hooks for mission endpoints
 * Export for use in components
 */
export const {
    useGetAvailableMissionsQuery,
    useGetMissionQuery,
    useGetMyMissionsQuery,
    useGetAllMissionsQuery,
    useGetRecommendedMissionsQuery,
    useGetMissionStatsQuery,
    useCreateMissionMutation,
    useUpdateMissionMutation,
    useDeleteMissionMutation,
} = missionApi;

