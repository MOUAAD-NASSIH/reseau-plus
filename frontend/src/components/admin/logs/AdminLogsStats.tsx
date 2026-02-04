import React from "react";
import { useTranslation } from "react-i18next";
import { Activity, Clock, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface AdminLogsStatsProps {
    stats: {
        total: number;
        today: number;
        yesterday: number;
        last7Days: number;
        mostFrequentAction: string;
    };
    isLoading: boolean;
}

export function AdminLogsStats({ stats, isLoading }: AdminLogsStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
                title={t("ADMIN_LOGS.STATS.TOTAL_ACTIONS")}
                value={stats.total}
                subtext={t("ADMIN_LOGS.STATS.TOTAL_DESC")}
                icon={<Activity />}
                iconColor="text-primary"
                isLoading={isLoading}
                delay="delay-[0ms]"
            />
            <StatCard
                title={t("ADMIN_LOGS.STATS.TODAY")}
                value={stats.today}
                subtext={`${t("ADMIN_LOGS.STATS.YESTERDAY")}: ${stats.yesterday}`}
                icon={<Zap />}
                iconColor="text-emerald-600 dark:text-emerald-400"
                isLoading={isLoading}
                delay="delay-[100ms]"
            />
            <StatCard
                title={t("ADMIN_LOGS.STATS.LAST_7_DAYS")}
                value={stats.last7Days}
                subtext={t("ADMIN_LOGS.STATS.WEEKLY_TREND")}
                icon={<Clock />}
                iconColor="text-amber-600 dark:text-amber-400"
                isLoading={isLoading}
                delay="delay-[200ms]"
            />
            <StatCard
                title={t("ADMIN_LOGS.STATS.MOST_FREQUENT")}
                value={stats.mostFrequentAction}
                subtext={t("ADMIN_LOGS.STATS.COMMON_TASK")}
                icon={<ShieldCheck />}
                iconColor="text-blue-600 dark:text-blue-400"
                isLoading={isLoading}
                delay="delay-[300ms]"
                isString={true}
            />
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: string | number;
    subtext: string;
    icon: React.ReactNode;
    iconColor?: string;
    isLoading?: boolean;
    className?: string;
    delay?: string;
    isString?: boolean;
}

function StatCard({
    title,
    value,
    subtext,
    icon,
    iconColor = "text-primary",
    isLoading,
    className,
    delay,
    isString = false
}: StatCardProps) {
    return (
        <Card className={cn(
            "relative overflow-hidden border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm group transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-4 duration-500",
            className,
            delay
        )}>
            {/* Background watermark icon */}
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                    className: `w-24 h-24 ${iconColor} transform rotate-12`
                }) : null}
            </div>

            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-3 relative z-10 w-full">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {title}
                        </h3>
                        <div className="flex items-baseline gap-2">
                            <div className={`${isString ? 'text-2xl' : 'text-4xl'} font-black tracking-tight text-foreground ${isString ? 'capitalize' : ''}`}>
                                {isLoading ? <Skeleton className="h-10 w-20" /> : value}
                            </div>
                        </div>
                        {subtext && (
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-muted-foreground font-medium opacity-70">{subtext}</span>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}