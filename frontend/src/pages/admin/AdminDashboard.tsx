import { EcosystemHeader } from "@/components/admin/dashboard/EcosystemHeader";
import { PlatformKPIs } from "@/components/admin/dashboard/PlatformKPIs";
import { PendingValidationPanel } from "@/components/admin/dashboard/PendingValidationPanel";
import { PendingDocumentsPanel } from "@/components/admin/dashboard/PendingDocumentsPanel";
import { MissionStatusChart } from "@/components/admin/dashboard/MissionStatusChart";
import { DashboardLogs } from "@/components/admin/dashboard/DashboardLogs";
import { useGetAdminDashboardQuery, useGetPendingWorkersQuery, useGetPendingDocumentsQuery } from "@/features/api/endpoints/adminEndpoints";

export default function AdminDashboard() {
    const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery();
    const { data: pendingWorkersData, isLoading: pendingWorkersLoading } = useGetPendingWorkersQuery({ limit: 3 });
    const { data: pendingDocsData, isLoading: pendingDocsLoading } = useGetPendingDocumentsQuery({ limit: 3 });

    const stats = dashboardData?.data;
    const pendingWorkers = pendingWorkersData?.data ?? [];
    const pendingDocs = pendingDocsData?.data ?? [];
console.log(stats);

    return (
        <div className="space-y-8 pb-8 font-spline">
            {/* Header */}
            <EcosystemHeader />

            {/* KPI Cards - Real Backend Data */}
            <PlatformKPIs stats={stats} isLoading={dashboardLoading} />

            <div className="flex flex-col gap-6">
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Left Column: Charts */}
                    <div className="xl:col-span-1 h-full">
                        <MissionStatusChart stats={stats} isLoading={dashboardLoading} />
                    </div>

                    {/* Right Column: Pending Actions */}
                    <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
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
