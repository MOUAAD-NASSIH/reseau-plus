import { AdminDashboardHeader } from "@/components/admin/dashboard/AdminDashboardHeader";
import { PlatformKPIs } from "@/components/admin/dashboard/PlatformKPIs";
import { PendingValidationPanel } from "@/components/admin/dashboard/PendingValidationPanel";
import { PendingDocumentsPanel } from "@/components/admin/dashboard/PendingDocumentsPanel";
import { MissionStatusChart } from "@/components/admin/dashboard/MissionStatusChart";
import { DashboardLogs } from "@/components/admin/dashboard/DashboardLogs";
import { useGetAdminDashboardQuery, useGetPendingWorkersQuery, useGetPendingDocumentsQuery } from "@/features/api/endpoints/adminEndpoints";

export default function AdminDashboard() {
    const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery();
    const { data: pendingWorkersData, isLoading: pendingWorkersLoading } = useGetPendingWorkersQuery({ limit: 5 });
    const { data: pendingDocsData, isLoading: pendingDocsLoading } = useGetPendingDocumentsQuery({ limit: 5 });

    const stats = dashboardData?.data;
    const pendingWorkers = pendingWorkersData?.data ?? [];
    const pendingDocs = pendingDocsData?.data ?? [];

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <AdminDashboardHeader />

            <div className="pt-6 space-y-8">
                {/* KPI Cards */}
                <PlatformKPIs stats={stats} isLoading={dashboardLoading} />

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* Left Column: Charts */}
                    <div className="xl:col-span-1 space-y-8 h-full">
                        <MissionStatusChart stats={stats} isLoading={dashboardLoading} />
                    </div>

                    {/* Right Column: Pending Actions */}
                    <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                        <PendingValidationPanel
                            pendingWorkers={pendingWorkers}
                            isLoading={pendingWorkersLoading}
                            totalCount={stats?.pendingVerifications || 0}
                        />
                        <PendingDocumentsPanel
                            pendingDocs={pendingDocs}
                            isLoading={pendingDocsLoading}
                            totalCount={stats?.pendingDocuments || 0}
                        />
                    </div>
                </div>

                {/* Full Width Logs Section */}
                <div className="w-full">
                    <DashboardLogs />
                </div>
            </div>
        </div>
    );
}
