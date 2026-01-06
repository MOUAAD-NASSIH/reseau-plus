/**
 * RTK Query API Barrel Export
 * Provides convenient access to all API hooks and utilities.
 */

// Core API
export { api, TAG_TYPES } from "./api";
export type { TagType } from "./api";
export { axiosBaseQuery } from "./baseQuery";

// Missions
export {
    useGetAvailableMissionsQuery,
    useGetMissionQuery,
    useGetMyMissionsQuery,
    useGetAllMissionsQuery,
    useGetRecommendedMissionsQuery,
    useGetMissionStatsQuery,
    useCreateMissionMutation,
    useUpdateMissionMutation,
    useDeleteMissionMutation,
    missionApi,
} from "./endpoints/missionEndpoints";
export type { MissionStats } from "./endpoints/missionEndpoints";

// Applications
export {
    useGetMyApplicationsQuery,
    useGetMissionApplicationsQuery,
    useGetApplicationQuery,
    useApplyToMissionMutation,
    useWithdrawApplicationMutation,
    useAcceptApplicationMutation,
    useRejectApplicationMutation,
    applicationApi,
} from "./endpoints/applicationEndpoints";

// Assignments
export {
    useGetMyAssignmentsQuery,
    useGetInstitutionAssignmentsQuery,
    useGetAllAssignmentsQuery,
    useGetAssignmentQuery,
    useUpdateAssignmentStatusMutation,
    assignmentApi,
} from "./endpoints/assignmentEndpoints";

// Workers
export {
    useGetWorkerProfileQuery,
    useGetWorkerQuery,
    useGetAllWorkersQuery,
    useGetWorkerDocumentsQuery,
    useGetWorkerAvailabilitiesQuery,
    useUpdateWorkerProfileMutation,
    useUploadDocumentMutation,
    useAddAvailabilityMutation,
    useUpdateAvailabilityMutation,
    useDeleteAvailabilityMutation,
    useAddWorkerDomainMutation,
    useRemoveWorkerDomainMutation,
    workerApi,
} from "./endpoints/workerEndpoints";
export type { WorkerAvailabilityInput } from "./endpoints/workerEndpoints";

// Institutions
export {
    useGetInstitutionProfileQuery,
    useGetInstitutionQuery,
    useGetAllInstitutionsQuery,
    useUpdateInstitutionProfileMutation,
    institutionApi,
} from "./endpoints/institutionEndpoints";

// Payments
export {
    useGetPaymentsQuery,
    useGetPaymentQuery,
    useGetPaymentSummaryQuery,
    useCreatePaymentIntentMutation,
    useCalculateFeesMutation,
    paymentApi,
} from "./endpoints/paymentEndpoints";
export type { PaymentSummary } from "./endpoints/paymentEndpoints";

// Notifications
export {
    useGetNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
    notificationApi,
} from "./endpoints/notificationEndpoints";
export type { UnreadCountResponse } from "./endpoints/notificationEndpoints";

// Reviews
export {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
    useGetWorkerReviewsQuery,
    useGetInstitutionReviewsQuery,
    useGetWorkerRatingQuery,
    useGetInstitutionRatingQuery,
    useGetAllReviewsQuery,
    useCreateReviewMutation,
    useDeleteReviewMutation,
    reviewApi,
} from "./endpoints/reviewEndpoints";

// Domains and Specialities
export {
    // Domain hooks
    useGetDomainsQuery,
    useGetDomainQuery,
    useCreateDomainMutation,
    useUpdateDomainMutation,
    useDeleteDomainMutation,
    // Speciality hooks
    useGetSpecialitiesQuery,
    useGetSpecialityQuery,
    useCreateSpecialityMutation,
    useUpdateSpecialityMutation,
    useDeleteSpecialityMutation,
    domainApi,
} from "./endpoints/domainEndpoints";
export type {
    CreateDomainInput,
    UpdateDomainInput,
    CreateSpecialityInput,
    UpdateSpecialityInput,
} from "./endpoints/domainEndpoints";

// Admin
export {
    useGetAdminDashboardQuery,
    useGetPendingWorkersQuery,
    useGetPendingDocumentsQuery,
    useGetAdminLogsQuery,
    useValidateWorkerMutation,
    useRejectWorkerMutation,
    useReviewDocumentMutation,
    useUpdateUserStatusMutation,
    adminApi,
} from "./endpoints/adminEndpoints";
export type {
    AdminDashboardStats,
    AdminLog,
    AdminLogFilters,
    PendingWorkersFilters,
    PendingDocumentsFilters,
} from "./endpoints/adminEndpoints";

// Auth
export {
    useGetCurrentUserQuery,
    useLoginMutation,
    useLogoutMutation,
    authApi,
} from "./endpoints/authEndpoints";

