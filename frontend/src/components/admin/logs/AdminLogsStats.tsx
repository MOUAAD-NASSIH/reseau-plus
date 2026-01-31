import { useTranslation } from "react-i18next";
import { Activity, Clock, ShieldCheck, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* TOTAL LOGS */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("ADMIN_LOGS.STATS.TOTAL_ACTIONS")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Activity className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-24" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter">{stats.total}</span>
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-4 font-black leading-relaxed opacity-60 uppercase tracking-widest">
                        {t("ADMIN_LOGS.STATS.TOTAL_DESC")}
                    </p>
                </CardContent>
            </Card>

            {/* RECORDED TODAY */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("ADMIN_LOGS.STATS.TODAY")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Zap className="h-5 w-5 fill-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-24" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter">{stats.today}</span>
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-4 font-black leading-relaxed opacity-60 uppercase tracking-widest">
                        {t("ADMIN_LOGS.STATS.YESTERDAY")}: {stats.yesterday}
                    </p>
                </CardContent>
            </Card>

            {/* LAST 7 DAYS */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("ADMIN_LOGS.STATS.LAST_7_DAYS")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-amber-500/10 text-amber-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Clock className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-24" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl font-black tracking-tighter">{stats.last7Days}</span>
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-4 font-black leading-relaxed opacity-60 uppercase tracking-widest">
                        {t("ADMIN_LOGS.STATS.WEEKLY_TREND")}
                    </p>
                </CardContent>
            </Card>

            {/* MOST FREQUENT */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("ADMIN_LOGS.STATS.MOST_FREQUENT")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ShieldCheck className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-32" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-xl font-black tracking-tight truncate w-full" title={stats.mostFrequentAction}>
                                {stats.mostFrequentAction}
                            </span>
                        </div>
                    )}
                    <p className="text-[10px] text-muted-foreground mt-4 font-black leading-relaxed opacity-60 uppercase tracking-widest">
                        {t("ADMIN_LOGS.STATS.COMMON_TASK")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}