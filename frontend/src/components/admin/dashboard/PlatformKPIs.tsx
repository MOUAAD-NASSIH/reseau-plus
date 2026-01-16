import { Users, Building2, Briefcase, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import type { AdminDashboardStats } from "@/features/api/endpoints/adminEndpoints";

interface PlatformKPIsProps {
    stats?: AdminDashboardStats;
    isLoading: boolean;
}

export function PlatformKPIs({ stats, isLoading }: PlatformKPIsProps) {
    console.log(stats);
    const { t } = useTranslation();

    const verifiedWorkersCount = stats?.workerStatusBreakdown?.find(s => s.status === 'VERIFIED')?.count || 0;

    const kpis = [
        {
            title: t("ADMIN_DASHBOARD.KPI.TOTAL_REVENUE"),
            value: stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString('fr-MA')} MAD` : "0 MAD",
            icon: Activity,
            colorClass: "text-emerald-600",
            bgClass: "bg-emerald-500/10",
            iconName: "Activity",
            subtitle: t("ADMIN_DASHBOARD.KPI.REVENUE_SUBTITLE", { count: stats?.totalPayments || 0 })
        },
        {
            title: t("ADMIN_DASHBOARD.KPI.ACTIVE_INSTITUTIONS"),
            value: stats?.totalInstitutions?.toString() || "0",
            icon: Building2,
            colorClass: "text-blue-600",
            bgClass: "bg-blue-500/10",
            iconName: "Building2",
            subtitle: t("ADMIN_DASHBOARD.KPI.GLOBAL_FOOTPRINT"),
        },
        {
            title: t("ADMIN_DASHBOARD.KPI.TOTAL_WORKERS"),
            value: stats?.totalWorkers?.toString() || "0",
            icon: Users,
            colorClass: "text-purple-600",
            bgClass: "bg-purple-500/10",
            iconName: "Users",
            subtitle: t("ADMIN_DASHBOARD.KPI.VERIFICATION_RATE", { 
                rate: stats?.totalWorkers && stats.totalWorkers > 0 
                    ? ((verifiedWorkersCount / stats.totalWorkers) * 100).toFixed(0) 
                    : "0"
            }),
        },
        {
            title: t("ADMIN_DASHBOARD.KPI.MISSIONS_FILLED"), // Or separate key for Active Missions
            value: stats?.activeMissions?.toString() || "0",
            icon: Briefcase,
            colorClass: "text-amber-600",
            bgClass: "bg-amber-500/10",
            iconName: "Briefcase",
            subtitle: t("ADMIN_DASHBOARD.KPI.MISSIONS_COUNT", { count: stats?.totalMissions || 0 }),
        },
    ];

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {kpis.map((kpi, index) => (
                <Card key={index} className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                         <kpi.icon className={`w-24 h-24 ${kpi.colorClass} transform rotate-12`} />
                    </div>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {kpi.title}
                        </CardTitle>
                        <div className={`h-9 w-9 ${kpi.bgClass} ${kpi.colorClass} rounded-lg flex items-center justify-center`}>
                            <kpi.icon className="h-5 w-5" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {isLoading ? <Skeleton className="h-8 w-24" /> : kpi.value}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground mt-1 font-medium">
                            <span>{kpi.subtitle}</span>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
