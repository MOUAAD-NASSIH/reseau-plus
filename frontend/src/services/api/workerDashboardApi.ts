// src/services/api/workerDashboardApi.ts
import { api } from "../../features/api/api";

type ApiOk<T> = { success: true; data: T };
type Paginated<T> = { success: true; data: T[]; pagination?: { total?: number } }; // adapt to your real shape

export const workerDashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWorkerMe: builder.query<ApiOk<{ id: number; firstName: string }>, void>({
      query: () => ({ url: "/workers/me" }),
      providesTags: ["Workers"],
    }),

    getMyApplications: builder.query<
      Paginated<any>,
      { status?: "SUBMITTED" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/applications/my",
        params: params && typeof params === 'object' ? { status: params.status, page: params.page || 1, limit: params.limit || 5 } : { page: 1, limit: 5 },
      }),
      providesTags: ["Applications"],
    }),

    getMyAssignments: builder.query<
      Paginated<any>,
      { status?: "ACTIVE" | "ONGOING" | "COMPLETED" | "CANCELLED"; page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/assignments/my",
        params: params && typeof params === 'object' ? { status: params.status, page: params.page || 1, limit: params.limit || 5 } : undefined,
      }),
      providesTags: ["Assignments"],
    }),

    getWorkerAverageRating: builder.query<ApiOk<{ average: number; count?: number }>, { workerId: number }>({
      query: ({ workerId }) => ({ url: `/reviews/worker/${workerId}/rating` }),
      providesTags: ["Reviews"],
    }),

    getNotifications: builder.query<Paginated<any>, { page?: number; limit?: number; isRead?: boolean } | void>({
      query: (params) => ({
        url: "/notifications",
        params: params && typeof params === 'object' ? { page: params.page || 1, limit: params.limit || 3, isRead: params.isRead } : { page: 1, limit: 3 },
      }),
      providesTags: ["Notifications"],
    }),

    getUnreadCount: builder.query<ApiOk<{ count: number }>, void>({
      query: () => ({ url: "/notifications/unread-count" }),
      providesTags: ["Notifications"],
    }),
  }),
  overrideExisting: false,
});

// RTK Query generates these hooks at runtime
export const {
  useGetWorkerMeQuery,
  useGetMyApplicationsQuery,
  useGetMyAssignmentsQuery,
  useGetWorkerAverageRatingQuery,
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
} = workerDashboardApi as any;
