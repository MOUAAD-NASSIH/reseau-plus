import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
    Activity,
    Bell,
    FileText,
    CheckCircle,
    XCircle,
    Briefcase,
    CheckSquare,
    CreditCard,
    UserCheck
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";
import type { Notification } from "@/types/notification.types";

interface RecentActivityListProps {
    notifications: Notification[];
    isLoading: boolean;
}

export function RecentActivityList({ notifications, isLoading }: RecentActivityListProps) {
    const { t } = useTranslation();

    return (
        <div className="md:col-span-3 lg:col-span-2 space-y-6">
            <Card className="border-none shadow-md h-full flex flex-col bg-card overflow-hidden">
                <CardHeader className="pb-3 border-b border-border">
                    <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        {t("INSTITUTION_DASHBOARD.SECTIONS.RECENT_ACTIVITY")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-auto p-0">
                    {isLoading ? (
                        <div className="space-y-4 p-6">
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                            <Skeleton className="h-16 w-full rounded-xl" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center justify-center h-full">
                            <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-full mb-3">
                                <Bell className="h-8 w-8 opacity-50" />
                            </div>
                            <p className="font-medium">{t("INSTITUTION_DASHBOARD.EMPTY_STATES.NO_ACTIVITY")}</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {notifications.map((notification) => {
                                let Icon = Bell;
                                let iconColor = "text-muted-foreground";
                                let iconBg = "bg-muted";

                                switch (notification.type) {
                                    case 'APPLICATION_SUBMITTED':
                                        Icon = FileText;
                                        iconColor = "text-primary";
                                        iconBg = "bg-primary/10";
                                        break;
                                    case 'APPLICATION_ACCEPTED':
                                        Icon = CheckCircle;
                                        iconColor = "text-chart-5";
                                        iconBg = "bg-chart-5/10";
                                        break;
                                    case 'APPLICATION_REJECTED':
                                        Icon = XCircle;
                                        iconColor = "text-destructive";
                                        iconBg = "bg-destructive/10";
                                        break;
                                    case 'ASSIGNMENT_CREATED':
                                        Icon = Briefcase;
                                        iconColor = "text-chart-2";
                                        iconBg = "bg-chart-2/10";
                                        break;
                                    case 'ASSIGNMENT_COMPLETED':
                                        Icon = CheckSquare;
                                        iconColor = "text-chart-5";
                                        iconBg = "bg-chart-5/10";
                                        break;
                                    case 'PAYMENT_RECEIVED':
                                        Icon = CreditCard;
                                        iconColor = "text-chart-4";
                                        iconBg = "bg-chart-4/10";
                                        break;
                                    case 'WORKER_VERIFIED':
                                        Icon = UserCheck;
                                        iconColor = "text-chart-1";
                                        iconBg = "bg-chart-1/10";
                                        break;
                                }

                                return (
                                    <div key={notification.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors flex gap-3 group">
                                        <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${iconBg} ${iconColor} mt-1`}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className={`text-sm font-medium leading-tight ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                                                {notification.message}
                                                {!notification.isRead && <span className="inline-block w-2 h-2 bg-primary rounded-full ml-2 align-middle"></span>}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
                <div className="p-4 border-t border-border bg-muted/20">
                    <Button variant="outline" className="w-full text-xs font-semibold font-spline h-9" asChild>
                        <Link to="/institution/notifications">
                            {t("INSTITUTION_DASHBOARD.SECTIONS.VIEW_ALL")}
                        </Link>
                    </Button>
                </div>
            </Card>
        </div>
    );
}
