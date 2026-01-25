import React from "react";
import { format } from "date-fns";
import { Wallet, Calendar, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface MissionKPIsProps {
    budget: number;
    startDate: string;
    endDate: string;
    activeApplicants: number;
    totalApplications: number;
    t: (key: string, options?: any) => string;
    isLoading?: boolean;
}

export function MissionKPIs({
    budget,
    startDate,
    endDate,
    activeApplicants,
    totalApplications,
    t,
    isLoading
}: MissionKPIsProps) {
    const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24));

    return (
        <div className="grid gap-6 md:grid-cols-3">
            <StatCard
                title={t("MISSION_DETAILS.TOTAL_BUDGET")}
                value={`${budget?.toLocaleString() || "0"} ${t("COMMON.CURRENCY")}`}
                icon={<Wallet />}
                iconColor="text-primary"
                isLoading={isLoading}
            />

            <StatCard
                title={t("MISSION_DETAILS.MISSION_TIMELINE")}
                value={`${format(new Date(startDate), "MMM d")} - ${format(new Date(endDate), "MMM d")}`}
                icon={<Calendar />}
                iconColor="text-chart-4"
                description={t("MISSION_DETAILS.MISSION_TIMELINE_DAYS", { count: days })}
                isLoading={isLoading}
            />

            <StatCard
                title={t("MISSION_DETAILS.APPLICANTS")}
                value={`${activeApplicants} ${t("MISSION_DETAILS.ACTIVE")}`}
                icon={<Users />}
                iconColor="text-chart-2"
                description={t("MISSION_DETAILS.TOTAL_ACROSS_STATUSES", { count: totalApplications })}
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
