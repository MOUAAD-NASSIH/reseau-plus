import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Clock, ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";

interface PriorityAlertsPanelProps {
    pendingWorkers?: any[];
    isLoading: boolean;
}

export function PriorityAlertsPanel({ isLoading }: PriorityAlertsPanelProps) {
    const { t } = useTranslation();

    // Mock priority alerts - in production, this would come from backend
    const alerts = [
        {
            id: 1,
            priority: "HIGH" as const,
            type: "billing",
            title: "Billing Discrepancy: General Health",
            description: "Payment mismatch detected. 3 invoices. Financial impact significant.",
            assignee: "Finance Team",
            time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        },
        {
            id: 2,
            priority: "MEDIUM" as const,
            type: "credential",
            title: "Worker Credentialing Delay",
            description: "Verification process for UK license verification is timed out at 70%.",
            assignee: "Compliance",
            time: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        },
        {
            id: 3,
            priority: "CRITICAL" as const,
            type: "error",
            title: "Mass Worker Logout Error",
            description: "Auth token refresh failing for workers in Asia Pacific region.",
            assignee: "DevOps",
            time: new Date(Date.now() - 20 * 60 * 1000), // 20 minutes ago
        },
    ];

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "CRITICAL":
                return {
                    bg: "bg-red-500/10",
                    border: "border-red-500/20",
                    text: "text-red-600 dark:text-red-400",
                    badge: "bg-red-500/20 text-red-700 dark:text-red-300",
                    icon: AlertCircle,
                };
            case "HIGH":
                return {
                    bg: "bg-orange-500/10",
                    border: "border-orange-500/20",
                    text: "text-orange-600 dark:text-orange-400",
                    badge: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
                    icon: AlertTriangle,
                };
            default:
                return {
                    bg: "bg-amber-500/10",
                    border: "border-amber-500/20",
                    text: "text-amber-600 dark:text-amber-400",
                    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
                    icon: AlertTriangle,
                };
        }
    };

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-lg font-bold tracking-tight">
                        {t("ADMIN_DASHBOARD.ALERTS.TITLE")}
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                        {alerts.length} {t("ADMIN_DASHBOARD.ALERTS.ACTIVE")}
                    </p>
                </div>
                <Button variant="link" size="sm" className="text-primary" asChild>
                    <Link to="/admin/support">
                        {t("ADMIN_DASHBOARD.ALERTS.VIEW_ALL")}
                        <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-24 w-full" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {alerts.map((alert) => {
                            const styles = getPriorityStyles(alert.priority);
                            const Icon = styles.icon;

                            return (
                                <div
                                    key={alert.id}
                                    className={`p-4 rounded-lg border ${styles.bg} ${styles.border} hover:shadow-md transition-shadow`}
                                >
                                    <div className="flex items-start gap-3">
                                        <Icon className={`h-5 w-5 ${styles.text} mt-0.5 shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${styles.badge}`}>
                                                        {alert.priority}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {alert.type.toUpperCase()}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(alert.time, { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className={`text-sm font-semibold ${styles.text} mb-1`}>
                                                {alert.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mb-2">
                                                {alert.description}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">
                                                    Assigned to:
                                                </span>
                                                <span className="text-xs font-medium text-foreground">
                                                    {alert.assignee}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
