import { useNavigate } from "react-router";
import { Bell, Check, CheckCheck, Trash2, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} from "@/features/api/endpoints/notificationEndpoints";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { Notification, NotificationType } from "@/types/notification.types";

/**
 * Get the redirect URL based on notification type for institution
 */
const getNotificationRedirectUrl = (type: NotificationType): string | null => {
    switch (type) {
        case "APPLICATION_SUBMITTED":
            return "/institution/missions"; // Go to missions to see applicants
        case "APPLICATION_ACCEPTED":
        case "ASSIGNMENT_CREATED":
        case "ASSIGNMENT_COMPLETED":
        case "ASSIGNMENT_CANCELLED":
            return "/institution/assignments";
        case "PAYMENT_RECEIVED":
        case "PAYMENT_FAILED":
            return "/institution/payments/history";
        case "REVIEW_RECEIVED":
            return "/institution/reviews";
        default:
            return null;
    }
};

export default function InstitutionNotifications() {
    const navigate = useNavigate();
    const { data: notificationsData, isLoading } = useGetNotificationsQuery();
    const [markAsRead, { isLoading: isMarkingAsRead }] = useMarkAsReadMutation();
    const [markAllAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllAsReadMutation();
    const [deleteNotification, { isLoading: isDeletingNotification }] = useDeleteNotificationMutation();

    const notifications = notificationsData?.data || [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    const handleMarkAsRead = async (id: number) => {
        try {
            await markAsRead(id).unwrap();
        } catch (error) {
            showErrorToast(error, "Failed to mark notification as read.");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
            showSuccessToast("All notifications marked as read");
        } catch (error) {
            showErrorToast(error, "Failed to mark all notifications as read.");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNotification(id).unwrap();
            showSuccessToast("Notification deleted");
        } catch (error) {
            showErrorToast(error, "Failed to delete notification.");
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        // Mark as read if not already read
        if (!notification.isRead) {
            handleMarkAsRead(notification.id);
        }
        // Navigate to the relevant page
        const redirectUrl = getNotificationRedirectUrl(notification.type);
        if (redirectUrl) {
            navigate(redirectUrl);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    <h1 className="text-xl font-semibold">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-medium px-2 py-0.5 rounded-full">
                            {unreadCount} unread
                        </span>
                    )}
                </div>
                {unreadCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAllAsRead}
                    >
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Mark all as read
                    </Button>
                )}
            </div>

            {/* Notifications List */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">All Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <div key={i} className="flex gap-4">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/4" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notifications.length === 0 ? (
                        <EmptyState
                            icon={Bell}
                            title="No notifications"
                            description="You're all caught up! New notifications will appear here."
                        />
                    ) : (
                        <div className="space-y-2">
                            {notifications.map((notification) => {
                                const redirectUrl = getNotificationRedirectUrl(notification.type);
                                return (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex items-start gap-4 p-4 rounded-lg border transition-colors",
                                            notification.isRead
                                                ? "bg-card"
                                                : "bg-muted/50 border-primary/20",
                                            redirectUrl && "cursor-pointer hover:bg-accent/50"
                                        )}
                                        onClick={redirectUrl ? () => handleNotificationClick(notification) : undefined}
                                        role={redirectUrl ? "button" : undefined}
                                        tabIndex={redirectUrl ? 0 : undefined}
                                        onKeyDown={redirectUrl ? (e) => {
                                            if (e.key === "Enter" || e.key === " ") {
                                                handleNotificationClick(notification);
                                            }
                                        } : undefined}
                                    >
                                        <div
                                            className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center",
                                                notification.isRead
                                                    ? "bg-muted"
                                                    : "bg-primary/10"
                                            )}
                                        >
                                            <Bell
                                                className={cn(
                                                    "h-5 w-5",
                                                    notification.isRead
                                                        ? "text-muted-foreground"
                                                        : "text-primary"
                                                )}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={cn(
                                                    "text-sm",
                                                    !notification.isRead && "font-medium"
                                                )}
                                            >
                                                {notification.message}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <Calendar className="h-3 w-3" />
                                                {formatDate(notification.createdAt)}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {redirectUrl && (
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            )}
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleMarkAsRead(notification.id);
                                                    }}
                                                    disabled={isMarkingAsRead}
                                                    title="Mark as read"
                                                    aria-label="Mark notification as read"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(notification.id);
                                                }}
                                                disabled={isDeletingNotification}
                                                title="Delete notification"
                                                aria-label="Delete notification"
                                                className="text-muted-foreground hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

