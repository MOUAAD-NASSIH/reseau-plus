import { Bell, Check, Trash2, ExternalLink, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/common/EmptyState";
import { WORKER_NOTIFICATION_METADATA } from "@/features/hooks/WorkerHooks/useWorkerNotifications";
import type { Notification } from "@/types/notification.types";

interface WorkerNotificationsListProps {
    notifications: Notification[];
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
    onNavigate: (url: string) => void;
    getRedirectUrl: (notification: Notification) => string | null;
    formatDate: (date: string) => string;
    t: (key: string) => string;
}

export function WorkerNotificationsList({
    notifications,
    onMarkAsRead,
    onDelete,
    onNavigate,
    getRedirectUrl,
    formatDate,
    t,
}: WorkerNotificationsListProps) {
    if (notifications.length === 0) {
        return (
            <EmptyState
                icon={Bell}
                title={t("WORKER_NOTIFICATIONS.EMPTY.ALL_TITLE")}
                description={t("WORKER_NOTIFICATIONS.EMPTY.ALL_DESC")}
            />
        );
    }

    return (
        <div className="space-y-3">
            {notifications.map((notification) => {
                const meta = WORKER_NOTIFICATION_METADATA[notification.type] || WORKER_NOTIFICATION_METADATA.GENERAL;
                const Icon = meta.icon;
                const redirectUrl = getRedirectUrl(notification);
                const isClickable = !!redirectUrl;

                return (
                    <Card
                        key={notification.id}
                        className={cn(
                            "group transition-all duration-300 border-l-4",
                            notification.isRead
                                ? "bg-background/50 border-l-border/50 opacity-75 hover:opacity-100"
                                : "bg-card border-l-primary shadow-lg shadow-primary/5",
                            isClickable && "cursor-pointer hover:shadow-xl hover:scale-[1.01]"
                        )}
                        onClick={() => {
                            if (!notification.isRead) onMarkAsRead(notification.id);
                            if (isClickable) onNavigate(redirectUrl);
                        }}
                    >
                        <CardContent className="p-5 flex gap-4">
                            {/* Icon */}
                            <div
                                className={cn(
                                    "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
                                    meta.color
                                )}
                            >
                                <Icon className="h-6 w-6" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-1">
                                <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border bg-background",
                                                    meta.color
                                                )}
                                            >
                                                {meta.category}
                                            </span>
                                            {!notification.isRead && (
                                                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                                            )}
                                        </div>
                                        <span className="text-xs font-medium text-muted-foreground whitespace-nowrap tabular-nums flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5" />
                                            {formatDate(notification.createdAt)}
                                        </span>
                                    </div>
                                    <p
                                        className={cn(
                                            "text-sm leading-relaxed",
                                            !notification.isRead
                                                ? "font-semibold text-foreground"
                                                : "font-medium text-muted-foreground"
                                        )}
                                    >
                                        {notification.message}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity -mr-2">
                                {!notification.isRead && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary rounded-xl"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMarkAsRead(notification.id);
                                        }}
                                        title={t("WORKER_NOTIFICATIONS.ACTIONS.MARK_READ")}
                                    >
                                        <Check className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive rounded-xl"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(notification.id);
                                    }}
                                    title={t("WORKER_NOTIFICATIONS.ACTIONS.DELETE")}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                {isClickable && (
                                    <div className="h-8 w-8 flex items-center justify-center text-muted-foreground/30">
                                        <ExternalLink className="h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
