import {
  useGetAdminDashboardQuery,
  useGetPendingWorkersQuery,
} from "@/features/api/endpoints/adminEndpoints";

export default function useAdminDashboard() {
  const { data: dashboardData, isLoading: dashboardLoading } =
    useGetAdminDashboardQuery(undefined, {
      refetchOnMountOrArgChange: true,
    });

  const { data: pendingWorkersData, isLoading: pendingWorkersLoading } =
    useGetPendingWorkersQuery({ limit: 5 });

  return {
    stats: dashboardData?.data ?? null,
    pendingWorkers: pendingWorkersData?.data ?? [],
    dashboardLoading,
    pendingWorkersLoading,
  };
}
