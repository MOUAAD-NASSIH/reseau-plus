import { Link } from "react-router";
import {
    Users,
    Building2,
    Briefcase,
    CreditCard,
    UserCheck,
    Clock,
    ArrowRight,
    AlertCircle,
    CheckCircle,
    FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KPICard } from "@/components/common/KPICard";
import {
    useGetAdminDashboardQuery,
    useGetPendingWorkersQuery,
} from "@/features/api/endpoints/adminEndpoints";

export default function AdminDashboard() {
    const { data: dashboardData, isLoading: dashboardLoading } = useGetAdminDashboardQuery(undefined, {
        // Ensure fresh data on mount
        refetchOnMountOrArgChange: true,
    });
    const { data: pendingWorkersData, isLoading: pendingWorkersLoading } = useGetPendingWorkersQuery(undefined, {
        // Ensure fresh data on mount
        refetchOnMountOrArgChange: true,
    });

    const stats = dashboardData?.data;
    const pendingWorkers = pendingWorkersData?.data || [];

    return (
        <div className="space-y-8">
            {/* Section: Workers & Validation KPIs */}
            <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Workers Overview
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <KPICard
                        title="Pending Validation"
                        value={stats?.pendingWorkers ?? 0}
                        icon={AlertCircle}
                        description="Workers awaiting verification"
                        isLoading={dashboardLoading}
                        variant="warning"
                        href="/admin/workers"
                    />
                    <KPICard
                        title="Verified Workers"
                        value={stats?.verifiedWorkers ?? 0}
                        icon={CheckCircle}
                        description="Active verified workers"
                        isLoading={dashboardLoading}
                        variant="success"
                    />
                    <KPICard
                        title="Total Workers"
                        value={stats?.totalWorkers ?? 0}
                        icon={Users}
                        description="All registered workers"
                        isLoading={dashboardLoading}
                    />
                    <KPICard
                        title="Institutions"
                        value={stats?.totalInstitutions ?? 0}
                        icon={Building2}
                        description="Registered institutions"
                        isLoading={dashboardLoading}
                    />
                </div>
            </section>

            {/* Section: Missions KPIs */}
            <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                    Missions Overview
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KPICard
                        title="Active Missions"
                        value={stats?.activeMissions ?? 0}
                        icon={Briefcase}
                        description="Currently active missions"
                        isLoading={dashboardLoading}
                        variant="info"
                        href="/admin/missions"
                    />
                    <KPICard
                        title="Total Missions"
                        value={stats?.totalMissions ?? 0}
                        icon={FileText}
                        description="All missions created"
                        isLoading={dashboardLoading}
                    />
                    <KPICard
                        title="Completion Rate"
                        value={
                            stats?.totalMissions && stats.totalMissions > 0
                                ? `${Math.round(((stats.totalMissions - stats.activeMissions) / stats.totalMissions) * 100)}%`
                                : "0%"
                        }
                        icon={CheckCircle}
                        description="Missions completed"
                        isLoading={dashboardLoading}
                        variant="success"
                    />
                </div>
            </section>

            {/* Section: Revenue & Payments KPIs */}
            <section>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                    Revenue Overview
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <KPICard
                        title="Total Payments"
                        value={stats?.totalPayments ?? 0}
                        icon={CreditCard}
                        description="All payment transactions"
                        isLoading={dashboardLoading}
                        href="/admin/payments"
                    />
                    <KPICard
                        title="Pending Payments"
                        value={stats?.pendingPayments ?? 0}
                        icon={Clock}
                        description="Awaiting processing"
                        isLoading={dashboardLoading}
                        variant="warning"
                    />
                    <KPICard
                        title="Processed Payments"
                        value={(stats?.totalPayments ?? 0) - (stats?.pendingPayments ?? 0)}
                        icon={CheckCircle}
                        description="Successfully completed"
                        isLoading={dashboardLoading}
                        variant="success"
                    />
                </div>
            </section>

            {/* Pending Validations & Quick Actions */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Pending Workers List */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <UserCheck className="h-5 w-5" />
                            Pending Worker Validations
                        </CardTitle>
                        <Button variant="ghost" size="sm" asChild>
                            <Link to="/admin/workers">View all</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {pendingWorkersLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-12 w-full" />
                                ))}
                            </div>
                        ) : pendingWorkers.length === 0 ? (
                            <div className="text-center py-8">
                                <CheckCircle className="h-12 w-12 text-success mx-auto mb-3 opacity-50" />
                                <p className="text-sm text-muted-foreground">
                                    No pending validations
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    All workers have been reviewed
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {pendingWorkers.slice(0, 5).map((worker) => (
                                    <Link
                                        key={worker.id}
                                        to={`/admin/workers`}
                                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                                                <Users className="h-5 w-5 text-warning" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">
                                                    {worker.firstName} {worker.lastName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {worker.speciality?.name || "No speciality"}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-4 w-4" />
                                            <span className="text-xs">
                                                {new Date(worker.createdAt).toLocaleDateString()}
                                            </span>
                                            <ArrowRight className="h-4 w-4 ml-2" />
                                        </div>
                                    </Link>
                                ))}
                                {pendingWorkers.length > 5 && (
                                    <p className="text-xs text-muted-foreground text-center pt-2">
                                        +{pendingWorkers.length - 5} more pending
                                    </p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start h-12" asChild>
                            <Link to="/admin/workers">
                                <UserCheck className="mr-3 h-5 w-5 text-warning" />
                                <div className="text-left">
                                    <p className="font-medium">Validate Workers</p>
                                    <p className="text-xs text-muted-foreground">
                                        {stats?.pendingWorkers ?? 0} pending
                                    </p>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" asChild>
                            <Link to="/admin/documents">
                                <FileText className="mr-3 h-5 w-5 text-info" />
                                <div className="text-left">
                                    <p className="font-medium">Review Documents</p>
                                    <p className="text-xs text-muted-foreground">
                                        Verify worker documents
                                    </p>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" asChild>
                            <Link to="/admin/domains">
                                <Building2 className="mr-3 h-5 w-5 text-primary" />
                                <div className="text-left">
                                    <p className="font-medium">Manage Domains</p>
                                    <p className="text-xs text-muted-foreground">
                                        Configure work domains
                                    </p>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4" />
                            </Link>
                        </Button>
                        <Button variant="outline" className="w-full justify-start h-12" asChild>
                            <Link to="/admin/logs">
                                <Clock className="mr-3 h-5 w-5 text-muted-foreground" />
                                <div className="text-left">
                                    <p className="font-medium">View Logs</p>
                                    <p className="text-xs text-muted-foreground">
                                        Admin activity history
                                    </p>
                                </div>
                                <ArrowRight className="ml-auto h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

