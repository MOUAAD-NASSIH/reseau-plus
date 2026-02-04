import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Clock, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PaymentKPIsProps {
    totals: {
        totalPaid: number;
        totalPending: number;
        activeMissions: number;
    };
    pendingCount: number;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
}

export function PaymentKPIs({ totals, pendingCount, isLoading, formatCurrency }: PaymentKPIsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* TOTAL PAID */}
            <StatCard
                title={t("FINANCIAL.KPI.TOTAL_PAID")}
                value={formatCurrency(totals.totalPaid)}
                icon={<CheckCircle2 />}
                iconColor="text-emerald-500"
                trend="+12%"
                trendUp={true}
                description={t("FINANCIAL.KPI.VS_LAST_MONTH")}
                isLoading={isLoading}
            />

            {/* PENDING INVOICES */}
            <StatCard
                title={t("FINANCIAL.KPI.AWAITING_PAYMENT")}
                value={formatCurrency(totals.totalPending)}
                icon={<Clock />}
                iconColor="text-amber-500"
                description={t("FINANCIAL.KPI.INVOICES_COUNT", { count: pendingCount })}
                isLoading={isLoading}
            />

            {/* ACTIVE MISSIONS */}
            <StatCard
                title={t("FINANCIAL.KPI.ACTIVE_MISSIONS")}
                value={totals.activeMissions}
                icon={<Globe />}
                iconColor="text-indigo-500"
                trend="-2%"
                trendUp={false}
                description={t("FINANCIAL.KPI.VS_LAST_MONTH")}
                isLoading={isLoading}
            />
        </div>
    );
}

// Reusable StatCard to match DashboardStats exactly
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
                                {isLoading ? <Skeleton className="h-8 w-32" /> : value}
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
