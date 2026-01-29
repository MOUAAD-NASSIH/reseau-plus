import React from "react";
import { Briefcase, Users, Activity, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface DashboardStatsProps {
    activeMissionsCount: number;
    openMissionsCount: number;
    assignedMissionsCount: number;
    totalPaymentAmount: number;
    assignmentsCount: number;
    isLoading: boolean;
}

export function DashboardStats({
    activeMissionsCount,
    openMissionsCount,
    assignedMissionsCount,
    totalPaymentAmount,
    assignmentsCount,
    isLoading
}: DashboardStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
                title={t("INSTITUTION_DASHBOARD.STATS.ACTIVE_MISSIONS")}
                value={activeMissionsCount}
                icon={<Briefcase />}
                iconColor="text-primary"
                description={`${openMissionsCount} ${t("INSTITUTION_DASHBOARD.ACTIONS.RECRUITING")}`}
                trend={`+${openMissionsCount} new`}
                trendUp={true}
                isLoading={isLoading}
            />
            <StatCard
                title={t("INSTITUTION_DASHBOARD.STATS.OPEN_MISSIONS")}
                value={openMissionsCount}
                icon={<Users />}
                iconColor="text-chart-4"
                description={t("INSTITUTION_DASHBOARD.ACTIONS.AWAITING_APPLICANTS")}
                isLoading={isLoading}
            />
            <StatCard
                title={t("INSTITUTION_DASHBOARD.STATS.ASSIGNED_MISSIONS")}
                value={assignedMissionsCount}
                icon={<Activity />}
                iconColor="text-chart-2"
                description={`${assignmentsCount} ${t("INSTITUTION_DASHBOARD.ACTIONS.TOTAL_ASSIGNMENTS")}`}
                isLoading={isLoading}
            />
            <StatCard
                title={t("INSTITUTION_DASHBOARD.STATS.TOTAL_PAYMENTS")}
                value={`${(totalPaymentAmount).toLocaleString()} MAD`}
                icon={<CreditCard />}
                iconColor="text-chart-5"
                description={t("INSTITUTION_DASHBOARD.ACTIONS.LIFETIME_TOTAL")}
                isLoading={isLoading}
            />
        </div>
    );
}

// Reusable StatCard to match WorkerDashboard exactly
interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconColor?: string;
    description?: string;
    trend?: string;
    trendUp?: boolean;
    className?: string;
    isLoading?: boolean;
}

function StatCard({
    title,
    value,
    icon,
    iconColor = "text-primary",
    description,
    trend,
    trendUp,
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
                        {(description || trend) && (
                            <div className="flex items-center gap-2 text-xs">
                                {trend && (
                                    <Badge variant={trendUp ? "default" : "destructive"} className={cn("h-5 px-1.5 font-medium", trendUp ? "bg-green-500/15 text-green-700 dark:text-green-400 hover:bg-green-500/25" : "")}>
                                        {trend}
                                    </Badge>
                                )}
                                {description && <span className="text-muted-foreground font-medium">{description}</span>}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
