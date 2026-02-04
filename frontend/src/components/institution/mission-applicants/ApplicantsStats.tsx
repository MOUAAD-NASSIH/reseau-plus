import React from "react";
import { Users, Clock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface ApplicantsStatsProps {
    stats: {
        total: number;
        pending: number;
        accepted: number;
    };
    isLoading?: boolean;
}

export function ApplicantsStats({ stats, isLoading }: ApplicantsStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                title={t("MISSION_APPLICANTS.STATS.TOTAL")}
                value={stats.total}
                icon={<Users />}
                iconColor="text-chart-2"
                description={t("MISSION_APPLICANTS.STATS.ALL_APPLICATIONS")}
                isLoading={isLoading}
            />

            <StatCard
                title={t("MISSION_APPLICANTS.STATS.PENDING")}
                value={stats.pending}
                icon={<Clock />}
                iconColor="text-chart-4"
                description={t("MISSION_APPLICANTS.STATS.NEEDS_ACTION")}
                isLoading={isLoading}
            />

            <StatCard
                title={t("MISSION_APPLICANTS.STATS.ACCEPTED")}
                value={stats.accepted}
                icon={<Check />}
                iconColor="text-primary"
                description={t("MISSION_APPLICANTS.STATS.ASSIGNED_WORKERS")}
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
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider font-spline">
                                {title}
                            </h3>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <div className="text-3xl font-bold tracking-tight text-foreground font-spline">
                                {isLoading ? <Skeleton className="h-8 w-16" /> : value}
                            </div>
                        </div>
                        {(description || trend) && (
                            <div className="flex items-center gap-2 text-xs">
                                {description && (
                                    <span className="flex items-center text-muted-foreground font-medium">
                                        {description}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
