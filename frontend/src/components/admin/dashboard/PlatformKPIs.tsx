import React from "react";
import { Users, Building2, Briefcase, Activity } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminDashboardStats } from "@/features/api/endpoints/adminEndpoints";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface PlatformKPIsProps {
    stats?: AdminDashboardStats;
    isLoading: boolean;
}

export function PlatformKPIs({ stats, isLoading }: PlatformKPIsProps) {
    const { t } = useTranslation();

    const verifiedWorkersCount = stats?.workerStatusBreakdown?.find(s => s.status === 'VERIFIED')?.count || 0;
    const workerVerificationRate = stats?.totalWorkers && stats.totalWorkers > 0
        ? ((verifiedWorkersCount / stats.totalWorkers) * 100).toFixed(0)
        : "0";

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title={t("ADMIN_DASHBOARD.KPI.TOTAL_REVENUE")}
                value={stats?.totalRevenue ? `${stats.totalRevenue.toLocaleString('fr-MA')} MAD` : "0 MAD"}
                icon={<Activity />}
                iconColor="text-emerald-600 dark:text-emerald-400"
                description={t("ADMIN_DASHBOARD.KPI.REVENUE_SUBTITLE", { count: stats?.totalPayments || 0 })}
                isLoading={isLoading}
            />
            <StatCard
                title={t("ADMIN_DASHBOARD.KPI.ACTIVE_INSTITUTIONS")}
                value={stats?.totalInstitutions?.toString() || "0"}
                icon={<Building2 />}
                iconColor="text-blue-600 dark:text-blue-400"
                description={t("ADMIN_DASHBOARD.KPI.GLOBAL_FOOTPRINT")}
                isLoading={isLoading}
            />
            <StatCard
                title={t("ADMIN_DASHBOARD.KPI.TOTAL_WORKERS")}
                value={stats?.totalWorkers?.toString() || "0"}
                icon={<Users />}
                iconColor="text-purple-600 dark:text-purple-400"
                description={t("ADMIN_DASHBOARD.KPI.VERIFICATION_RATE", { rate: workerVerificationRate })}
                isLoading={isLoading}
            />
            <StatCard
                title={t("ADMIN_DASHBOARD.KPI.MISSIONS_FILLED")}
                value={stats?.activeMissions?.toString() || "0"}
                icon={<Briefcase />}
                iconColor="text-amber-600 dark:text-amber-400"
                description={t("ADMIN_DASHBOARD.KPI.MISSIONS_COUNT", { count: stats?.totalMissions || 0 })}
                isLoading={isLoading}
            />
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconColor?: string;
    description?: string;
    className?: string;
    isLoading?: boolean;
}

function StatCard({
    title,
    value,
    icon,
    iconColor = "text-primary",
    description,
    className,
    isLoading
}: StatCardProps) {
    return (
        <Card className={cn(
            "relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg",
            className
        )}>
            {/* Background watermark icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                    className: `w-24 h-24 ${iconColor} transform rotate-12`
                }) : null}
            </div>

            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-4 relative z-10 w-full">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            {title}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : value}
                            </div>
                        </div>
                        {description && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground font-medium">{description}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

