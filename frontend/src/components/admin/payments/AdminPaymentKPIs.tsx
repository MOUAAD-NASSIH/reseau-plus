import React from "react";
import { DollarSign, TrendingUp, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminPaymentKPIsProps {
    totals: {
        totalRevenue: number;
        totalFees: number;
        totalWorkerPayouts: number;
    };
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
}

export function AdminPaymentKPIs({ totals, isLoading, formatCurrency }: AdminPaymentKPIsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatCard
                title={t("ADMIN_PAYMENTS.KPI.TOTAL_REVENUE")}
                value={formatCurrency(totals?.totalRevenue || 0)}
                icon={<TrendingUp />}
                iconColor="text-emerald-600 dark:text-emerald-400"
                description={t("ADMIN_PAYMENTS.KPI.TOTAL_REVENUE_DESC")}
                isLoading={isLoading}
            />
            <StatCard
                title={t("ADMIN_PAYMENTS.KPI.PLATFORM_FEES")}
                value={formatCurrency(totals?.totalFees || 0)}
                icon={<DollarSign />}
                iconColor="text-blue-600 dark:text-blue-400"
                description={t("ADMIN_PAYMENTS.KPI.PLATFORM_FEES_DESC")}
                isLoading={isLoading}
            />
            <StatCard
                title={t("ADMIN_PAYMENTS.KPI.WORKER_PAYOUTS")}
                value={formatCurrency(totals?.totalWorkerPayouts || 0)}
                icon={<User />}
                iconColor="text-purple-600 dark:text-purple-400"
                description={t("ADMIN_PAYMENTS.KPI.WORKER_PAYOUTS_DESC")}
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
