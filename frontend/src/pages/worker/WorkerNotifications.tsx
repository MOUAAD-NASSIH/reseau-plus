import { useState } from "react";
import { useNavigate } from "react-router";
import { formatDistanceToNow } from "date-fns";
import {
    Bell,
    Check,
    CheckCheck,
    Loader2,
    Briefcase,
    ClipboardList,
    DollarSign,
    Star,
    FileText,
    AlertCircle,
    Trash2,
    ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useNotifications,
    useMarkAsRead,
    useMarkAllAsRead,
    useDeleteNotification,
} from "@/features/hooks/useNotifications";
import type { Notification, NotificationType } from "@/types/notification.types";
import { cn } from "@/lib/utils";
import { useAppSelector } from "@/features/helpers";

/**
 * Get the redirect URL based on notification type and user role
 */
const getNotificationRedirectUrl = (type: NotificationType, role: string): string | null => {
    switch (type) {
        // Worker notifications
        case "APPLICATION_ACCEPTED":
        case "ASSIGNMENT_CREATED":
            return role === "worker" ? "/worker/assignments" : "/institution/assignments";
        case "APPLICATION_REJECTED":
        case "APPLICATION_SUBMITTED":
            return role === "worker" ? "/worker/applications" : null;
        case "WORKER_VERIFIED":
        case "WORKER_REJECTED":
            return role === "worker" ? "/worker" : null;
        case "DOCUMENT_APPROVED":
        case "DOCUMENT_REJECTED":
            return role === "worker" ? "/worker/documents" : null;
        case "PAYMENT_RECEIVED":
            return role === "worker" ? "/worker/assignments" : "/institution/payments/history";
        case "PAYMENT_FAILED":
            return role === "institution" ? "/institution/payments/history" : null;
        case "ASSIGNMENT_COMPLETED":
            return role === "worker" ? "/worker/assignments" : "/institution/assignments";
        case "ASSIGNMENT_CANCELLED":
            return role === "worker" ? "/worker/assignments" : "/institution/assignments";
        case "REVIEW_RECEIVED":
            return role === "worker" ? "/worker/reviews" : "/institution/reviews";
        default:
            return null;
    }
};

/**
 * Render icon for notification type
 */
function NotificationIcon({ type, className }: { type: NotificationType; className?: string }) {
    const iconClass = className || "h-5 w-5";
    switch (type) {
        case "APPLICATION_SUBMITTED":
        case "APPLICATION_ACCEPTED":
        case "APPLICATION_REJECTED":
            return <ClipboardList className={iconClass} />;
        case "ASSIGNMENT_CREATED":
        case "ASSIGNMENT_COMPLETED":
        case "ASSIGNMENT_CANCELLED":
            return <Briefcase className={iconClass} />;
        case "PAYMENT_RECEIVED":
        case "PAYMENT_FAILED":
            return <DollarSign className={iconClass} />;
        case "WORKER_VERIFIED":
        case "WORKER_REJECTED":
            return <Check className={iconClass} />;
        case "DOCUMENT_APPROVED":
        case "DOCUMENT_REJECTED":
            return <FileText className={iconClass} />;
        case "REVIEW_RECEIVED":
            return <Star className={iconClass} />;
        default:
            return <Bell className={iconClass} />;
    }
}

/**
 * Get color class for notification type
 */
function getNotificationColor(type: NotificationType): string {
    switch (type) {
        case "APPLICATION_ACCEPTED":
        case "ASSIGNMENT_COMPLETED":
        case "PAYMENT_RECEIVED":
        case "WORKER_VERIFIED":
        case "DOCUMENT_APPROVED":
            return "text-success bg-success/10";
        case "APPLICATION_REJECTED":
        case "ASSIGNMENT_CANCELLED":
        case "PAYMENT_FAILED":
        case "WORKER_REJECTED":
        case "DOCUMENT_REJECTED":
            return "text-destructive bg-destructive/10";
        case "APPLICATION_SUBMITTED":
        case "ASSIGNMENT_CREATED":
            return "text-info bg-info/10";
        case "REVIEW_RECEIVED":
            return "text-warning bg-warning/10";
        default:
            return "text-muted-foreground bg-muted";
    }
}

interface NotificationCardProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
    onDelete: (id: number) => void;
    onNavigate: (notification: Notification) => void;
    isMarkingAsRead: boolean;
    isDeleting: boolean;
    userRole: string;
}

function NotificationCard({
    notification,
    onMarkAsRead,
    onDelete,
    onNavigate,
    isMarkingAsRead,
    isDeleting,
    userRole,
}: NotificationCardProps) {
    const colorClass = getNotificationColor(notification.type);
    const redirectUrl = getNotificationRedirectUrl(notification.type, userRole);

    const handleClick = () => {
        // Mark as read if not already read
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        // Navigate to the relevant page
        onNavigate(notification);
    };

    return (
        <Card
            className={cn(
                !notification.isRead && "border-primary/50 bg-primary/5",
                redirectUrl && "cursor-pointer hover:bg-accent/50 transition-colors"
            )}
            onClick={redirectUrl ? handleClick : undefined}
        >
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-full shrink-0", colorClass)}>
                        <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className={cn("text-sm", !notification.isRead && "font-medium")}>
                            {notification.message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                                addSuffix: true,
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        {redirectUrl && (
                            <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        )}
                        {!notification.isRead && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onMarkAsRead(notification.id);
                                }}
                                disabled={isMarkingAsRead}
                                title="Mark as read"
                            >
                                {isMarkingAsRead ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Check className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(notification.id);
                            }}
                            disabled={isDeleting}
                            title="Delete notification"
                            className="text-muted-foreground hover:text-destructive"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function WorkerNotifications() {
    const navigate = useNavigate();
    const user = useAppSelector((s) => s.auth.user);
    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
    const [markingId, setMarkingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const apiUser = user as { role?: string };
    const userRole = apiUser?.role || "worker";

    const { data: notificationsData, isLoading } = useNotifications();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();
    const deleteNotification = useDeleteNotification();

    const notifications = notificationsData?.data || [];
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const displayedNotifications =
        activeTab === "unread" ? unreadNotifications : notifications;

    const handleMarkAsRead = async (id: number) => {
        setMarkingId(id);
        try {
            await markAsRead.mutateAsync(id);
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead.mutateAsync();
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteNotification.mutateAsync(id);
        } finally {
            setDeletingId(null);
        }
    };

    const handleNotificationClick = (notification: Notification) => {
        const redirectUrl = getNotificationRedirectUrl(notification.type, userRole);
        if (redirectUrl) {
            navigate(redirectUrl);
        }
    };

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">
                                    Total Notifications
                                </p>
                                <p className="text-2xl font-bold">{notifications.length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Unread</p>
                                <p className="text-2xl font-bold">
                                    {unreadNotifications.length}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-info/10">
                                <AlertCircle className="h-5 w-5 text-info" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Read</p>
                                <p className="text-2xl font-bold">
                                    {notifications.length - unreadNotifications.length}
                                </p>
                            </div>
                            <div className="p-2 rounded-lg bg-success/10">
                                <CheckCheck className="h-5 w-5 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications List */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Stay updated with your activity on the platform
                        </CardDescription>
                    </div>
                    {unreadNotifications.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleMarkAllAsRead}
                            disabled={markAllAsRead.isPending}
                        >
                            {markAllAsRead.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCheck className="mr-2 h-4 w-4" />
                            )}
                            Mark all as read
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={activeTab}
                        onValueChange={(v) => setActiveTab(v as "all" | "unread")}
                    >
                        <TabsList className="mb-4">
                            <TabsTrigger value="all">
                                All ({notifications.length})
                            </TabsTrigger>
                            <TabsTrigger value="unread">
                                Unread ({unreadNotifications.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="all" className="space-y-3 mt-0">
                            {isLoading ? (
                                <NotificationsSkeleton />
                            ) : displayedNotifications.length === 0 ? (
                                <EmptyState
                                    icon={Bell}
                                    title="No notifications"
                                    description="You're all caught up! New notifications will appear here."
                                />
                            ) : (
                                displayedNotifications.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        onNavigate={handleNotificationClick}
                                        isMarkingAsRead={markingId === notification.id}
                                        isDeleting={deletingId === notification.id}
                                        userRole={userRole}
                                    />
                                ))
                            )}
                        </TabsContent>

                        <TabsContent value="unread" className="space-y-3 mt-0">
                            {isLoading ? (
                                <NotificationsSkeleton />
                            ) : unreadNotifications.length === 0 ? (
                                <EmptyState
                                    icon={CheckCheck}
                                    title="No unread notifications"
                                    description="You've read all your notifications."
                                />
                            ) : (
                                unreadNotifications.map((notification) => (
                                    <NotificationCard
                                        key={notification.id}
                                        notification={notification}
                                        onMarkAsRead={handleMarkAsRead}
                                        onDelete={handleDelete}
                                        onNavigate={handleNotificationClick}
                                        isMarkingAsRead={markingId === notification.id}
                                        isDeleting={deletingId === notification.id}
                                        userRole={userRole}
                                    />
                                ))
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function NotificationsSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
                <Card key={i}>
                    <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/4" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
