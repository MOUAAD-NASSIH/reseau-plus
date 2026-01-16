/**
 * Worker Endpoints - RTK Query endpoints for worker profile and related operations
 */

import { api } from "../api";
import type { ApiResponse } from "@/types/api.types";
import type {
    Worker,
    WorkerDocument,
    WorkerAvailability,
    UpdateWorkerInput,
    WorkerFilters,
    DocumentType,
} from "@/types/auth.types";
import type { MissionApplication } from "@/types/application.types";
import type { MissionAssignment } from "@/types/assignment.types";

export interface WorkerAvailabilityInput {
    startDate: string;
    endDate: string;
    status?: 'available' | 'blocked';
    isRecurring?: boolean;
}

export const workerApi = api.injectEndpoints({
    endpoints: (builder) => ({
        // Get current worker's profile
        getWorkerProfile: builder.query<ApiResponse<Worker>, void>({
            query: () => ({ url: "/workers/me" }),
            providesTags: [{ type: "Workers", id: "PROFILE" }],
        }),

        // Get a worker by ID
        getWorker: builder.query<ApiResponse<Worker>, number>({
            query: (id) => ({ url: `/workers/${id}` }),
            providesTags: (_, __, id) => [{ type: "Workers", id }],
        }),

        // Get all workers (admin only)
        getAllWorkers: builder.query<ApiResponse<Worker[]>, WorkerFilters | void>({
            query: (filters) => ({
                url: "/workers",
                params: filters || undefined,
            }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({ type: "Workers" as const, id })),
                        { type: "Workers", id: "LIST" },
                    ]
                    : [{ type: "Workers", id: "LIST" }],
        }),

        // Get worker's documents
        getWorkerDocuments: builder.query<ApiResponse<WorkerDocument[]>, void>({
            query: () => ({ url: "/workers/documents" }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({ type: "Workers" as const, id: `DOCUMENT_${id}` })),
                        { type: "Workers", id: "DOCUMENTS" },
                    ]
                    : [{ type: "Workers", id: "DOCUMENTS" }],
        }),

        // Get worker's availabilities
        getWorkerAvailabilities: builder.query<ApiResponse<WorkerAvailability[]>, void>({
            query: () => ({ url: "/workers/availabilities" }),
            providesTags: (result) =>
                result?.data
                    ? [
                        ...result.data.map(({ id }) => ({ type: "Workers" as const, id: `AVAILABILITY_${id}` })),
                        { type: "Workers", id: "AVAILABILITIES" },
                    ]
                    : [{ type: "Workers", id: "AVAILABILITIES" }],
        }),

        // Update current worker's profile
        updateWorkerProfile: builder.mutation<ApiResponse<Worker>, UpdateWorkerInput>({
            query: (data) => ({
                url: "/workers/me",
                method: "PUT",
                data,
            }),
            invalidatesTags: [
                { type: "Workers", id: "PROFILE" },
                { type: "Workers", id: "LIST" },
            ],
        }),

        // Upload profile picture (POST /api/profile/worker/picture)
        uploadProfilePicture: builder.mutation<ApiResponse<{ url: string; publicId: string }>, FormData>({
            query: (formData) => ({
                url: "/profile/worker/picture",
                method: "POST",
                data: formData,
            }),
            invalidatesTags: [
                { type: "Workers", id: "PROFILE" },
                { type: "Workers", id: "LIST" },
                { type: "Auth", id: "ME" },
            ],
        }),

        // Delete profile picture
        deleteProfilePicture: builder.mutation<ApiResponse<void>, void>({
            query: () => ({
                url: "/profile/worker/picture",
                method: "DELETE",
            }),
            invalidatesTags: [
                { type: "Workers", id: "PROFILE" },
                { type: "Workers", id: "LIST" },
                { type: "Auth", id: "ME" },
            ],
        }),

        // Upload a document
        uploadDocument: builder.mutation<ApiResponse<WorkerDocument>, { type: DocumentType; file: File }>({
            query: ({ type, file }) => {
                const formData = new FormData();
                formData.append("document", file);
                formData.append("type", type);
                return {
                    url: "/workers/documents",
                    method: "POST",
                    data: formData,
                };
            },
            invalidatesTags: [
                { type: "Workers", id: "DOCUMENTS" },
                { type: "Workers", id: "PROFILE" },
            ],
        }),

        // Add availability
        addAvailability: builder.mutation<ApiResponse<WorkerAvailability>, WorkerAvailabilityInput>({
            query: (data) => ({
                url: "/workers/availabilities",
                method: "POST",
                data,
            }),
            invalidatesTags: [{ type: "Workers", id: "AVAILABILITIES" }],
        }),

        // Update availability
        updateAvailability: builder.mutation<
            ApiResponse<WorkerAvailability>,
            { id: number; data: Partial<WorkerAvailabilityInput> }
        >({
            query: ({ id, data }) => ({
                url: `/workers/availabilities/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: (_, __, { id }) => [
                { type: "Workers", id: `AVAILABILITY_${id}` },
                { type: "Workers", id: "AVAILABILITIES" },
            ],
        }),

        // Delete availability
        deleteAvailability: builder.mutation<ApiResponse<void>, number>({
            query: (id) => ({
                url: `/workers/availabilities/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: [{ type: "Workers", id: "AVAILABILITIES" }],
        }),

        // Add a domain to worker
        addWorkerDomain: builder.mutation<ApiResponse<void>, number>({
            query: (domainId) => ({
                url: "/workers/domains",
                method: "POST",
                data: { domainId },
            }),
            invalidatesTags: [
                { type: "Workers", id: "PROFILE" },
                { type: "Workers", id: "LIST" },
            ],
        }),

        // Remove a domain from worker
        removeWorkerDomain: builder.mutation<ApiResponse<void>, number>({
            query: (domainId) => ({
                url: `/workers/domains/${domainId}`,
                method: "DELETE",
            }),
            invalidatesTags: [
                { type: "Workers", id: "PROFILE" },
                { type: "Workers", id: "LIST" },
            ],
        }),

        // Get my applications
        getMyApplications: builder.query<
            ApiResponse<MissionApplication[]>,
            { status?: "SUBMITTED" | "ACCEPTED" | "REJECTED"; page?: number; limit?: number } | void
        >({
            query: (params) => ({
                url: "/applications/my",
                params: params ? { status: params.status, page: params.page || 1, limit: params.limit || 5 } : { page: 1, limit: 5 },
            }),
            providesTags: ["Applications"],
        }),

        // Get my assignments
        getMyAssignments: builder.query<
            ApiResponse<MissionAssignment[]>,
            { status?: "ACTIVE" | "ONGOING" | "COMPLETED" | "CANCELLED"; page?: number; limit?: number } | void
        >({
            query: (params) => ({
                url: "/assignments/my",
                params: params ? { status: params.status, page: params.page || 1, limit: params.limit || 5 } : undefined,
            }),
            providesTags: ["Assignments"],
        }),

        // Get worker average rating
        getWorkerAverageRating: builder.query<ApiResponse<{ average: number; count?: number }>, { workerId: number }>({
            query: ({ workerId }) => ({ url: `/reviews/worker/${workerId}/rating` }),
            providesTags: ["Reviews"],
        }),
    }),
});

export const {
    useGetWorkerProfileQuery,
    useGetWorkerQuery,
    useGetAllWorkersQuery,
    useGetWorkerDocumentsQuery,
    useGetWorkerAvailabilitiesQuery,
    useUpdateWorkerProfileMutation,
    useUploadProfilePictureMutation,
    useDeleteProfilePictureMutation,
    useUploadDocumentMutation,
    useAddAvailabilityMutation,
    useUpdateAvailabilityMutation,
    useDeleteAvailabilityMutation,
    useAddWorkerDomainMutation,
    useRemoveWorkerDomainMutation,
    useGetMyApplicationsQuery,
    useGetMyAssignmentsQuery,
    useGetWorkerAverageRatingQuery,
} = workerApi;
