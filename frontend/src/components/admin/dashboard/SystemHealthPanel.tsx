import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, AlertTriangle, Server } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { AdminDashboardStats } from "@/features/api/endpoints/adminEndpoints";

interface SystemHealthPanelProps {
    stats?: AdminDashboardStats;
    isLoading: boolean;
}

export function SystemHealthPanel({ isLoading }: SystemHealthPanelProps) {
    const { t } = useTranslation();

    // Mock system health data - in production, this would come from backend
    const healthMetrics = {
        apiLatency: 42,
        uptime: 99.98,
        activeAlerts: 2,
    };

    const alerts = [
        {
            id: 1,
            type: "error" as const,
            title: t("ADMIN_DASHBOARD.HEALTH.ALERT_HIGH_LOAD"),
            description: t("ADMIN_DASHBOARD.HEALTH.ALERT_HIGH_LOAD_DESC"),
        },
        {
            id: 2,
            type: "warning" as const,
            title: t("ADMIN_DASHBOARD.HEALTH.ALERT_BACKUP"),
            description: t("ADMIN_DASHBOARD.HEALTH.ALERT_BACKUP_DESC"),
        },
    ];

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
            <CardHeader>
                <CardTitle className="text-lg font-bold tracking-tight">
                    {t("ADMIN_DASHBOARD.HEALTH.TITLE")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {isLoading ? (
                    <Skeleton className="h-32 w-full" />
                ) : (
                    <>
                        {/* Health Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <Server className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t("ADMIN_DASHBOARD.HEALTH.API_LATENCY")}
                                    </span>
                                </div>
                                <p className="text-2xl font-black text-foreground">{healthMetrics.apiLatency}ms</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {t("ADMIN_DASHBOARD.HEALTH.UPTIME")}
                                    </span>
                                </div>
                                <p className="text-2xl font-black text-foreground">{healthMetrics.uptime}%</p>
                            </div>
                        </div>

                        {/* Active Alerts */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {t("ADMIN_DASHBOARD.HEALTH.ACTIVE_ALERTS", { count: healthMetrics.activeAlerts })}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {alerts.map((alert) => (
                                    <div
                                        key={alert.id}
                                        className={`p-3 rounded-lg border ${alert.type === "error"
                                                ? "bg-red-500/5 border-red-500/20"
                                                : "bg-amber-500/5 border-amber-500/20"
                                            }`}
                                    >
                                        <div className="flex items-start gap-2">
                                            {alert.type === "error" ? (
                                                <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
                                            ) : (
                                                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-semibold ${alert.type === "error" ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                                                    }`}>
                                                    {alert.title}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {alert.description}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
