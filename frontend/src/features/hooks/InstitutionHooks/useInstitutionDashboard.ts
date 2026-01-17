import { useTranslation } from "react-i18next";
import { useGetInstitutionProfileQuery } from "@/features/api/endpoints/institutionEndpoints";
import { useGetMyMissionsQuery, useGetMissionStatsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import { useGetInstitutionAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetNotificationsQuery } from "@/features/api/endpoints/notificationEndpoints";

export const useInstitutionDashboard = () => {
    const { t } = useTranslation();
    const { data: profileData, isLoading: profileLoading } = useGetInstitutionProfileQuery();
    const { data: missionsData, isLoading: missionsLoading } = useGetMyMissionsQuery();
    const { data: statsData, isLoading: statsLoading } = useGetMissionStatsQuery();
    const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery({ limit: 100 });
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetInstitutionAssignmentsQuery();
    const { data: notificationsData, isLoading: notificationsLoading } = useGetNotificationsQuery({ limit: 5 });

    const institution = profileData?.data;
    const missions = missionsData?.data || [];
    const stats = statsData?.data;
    const payments = paymentsData?.data || [];
    const assignments = assignmentsData?.data || [];
    const notifications = notificationsData?.data || [];

    // Real KPI values from API
    const activeMissionsCount = (stats?.open || 0) + (stats?.ongoing || 0);
    const openMissionsCount = stats?.open || 0;
    const assignedMissionsCount = assignments.filter(a => a.status === 'ACTIVE' || a.status === 'ONGOING').length;

    // Payment stat
    const totalPaymentAmount = payments
        .filter((p) => p.status === "COMPLETED" || (p as any).stripePaymentId !== null)
        .reduce((sum, p) => sum + p.amountTotal, 0);

    return {
        t,
        institution,
        missions,
        stats,
        payments,
        assignments,
        notifications,
        profileLoading,
        missionsLoading,
        statsLoading,
        paymentsLoading,
        assignmentsLoading,
        notificationsLoading,
        activeMissionsCount,
        openMissionsCount,
        assignedMissionsCount,
        totalPaymentAmount,
    };
};
