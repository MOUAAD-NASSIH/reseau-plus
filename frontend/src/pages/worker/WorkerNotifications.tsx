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
    Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} from "@/features/api/endpoints/notificationEndpoints";
import type { Notification, NotificationType } from "@/types/notification.types";
import { cn } from "@/lib/utils";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import { useState } from "react";

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

function getNotificationStyles(type: NotificationType) {
    switch (type) {
        case "APPLICATION_ACCEPTED":
        case "ASSIGNMENT_COMPLETED":
        case "PAYMENT_RECEIVED":
        case "WORKER_VERIFIED":
        case "DOCUMENT_APPROVED":
            return {
                bg: "bg-emerald-50 dark:bg-emerald-950/20",
                border: "border-emerald-200 dark:border-emerald-900/50",
                iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
                iconColor: "text-emerald-600 dark:text-emerald-400"
            };
        case "APPLICATION_REJECTED":
        case "ASSIGNMENT_CANCELLED":
        case "PAYMENT_FAILED":
        case "WORKER_REJECTED":
        case "DOCUMENT_REJECTED":
            return {
                bg: "bg-red-50 dark:bg-red-950/20",
                border: "border-red-200 dark:border-red-900/50",
                iconBg: "bg-red-100 dark:bg-red-900/40",
                iconColor: "text-red-600 dark:text-red-400"
            };
        case "APPLICATION_SUBMITTED":
        case "ASSIGNMENT_CREATED":
            return {
                bg: "bg-blue-50 dark:bg-blue-950/20",
                border: "border-blue-200 dark:border-blue-900/50",
                iconBg: "bg-blue-100 dark:bg-blue-900/40",
                iconColor: "text-blue-600 dark:text-blue-400"
            };
        case "REVIEW_RECEIVED":
            return {
                bg: "bg-yellow-50 dark:bg-yellow-950/20",
                border: "border-yellow-200 dark:border-yellow-900/50",
                iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
                iconColor: "text-yellow-600 dark:text-yellow-400"
            };
        default:
            return {
                bg: "bg-card",
                border: "border-border",
                iconBg: "bg-muted",
                iconColor: "text-muted-foreground"
            };
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
    const styles = getNotificationStyles(notification.type);
    const redirectUrl = getNotificationRedirectUrl(notification.type, userRole);

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        onNavigate(notification);
    };

    return (
        <div
            onClick={redirectUrl ? handleClick : undefined}
            className={cn(
                "group relative overflow-hidden rounded-xl border p-4 transition-all duration-300",
                styles.bg,
                styles.border,
                redirectUrl ? "cursor-pointer hover:shadow-md hover:scale-[1.01]" : "",
                !notification.isRead ? "shadow-sm ring-1 ring-primary/20" : "opacity-80 hover:opacity-100"
            )}
        >
            <div className="flex gap-4">
                {/* Icon */}
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full", styles.iconBg)}>
                    <div className={styles.iconColor}>
                        <NotificationIcon type={notification.type} />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                        <p className={cn("text-sm", !notification.isRead ? "font-bold text-foreground" : "font-medium text-foreground/80")}>
                            {notification.message}
                        </p>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0">
                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                    </div>

                    {!notification.isRead && (
                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            New
                        </span>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2 sm:static sm:opacity-100">
                    {!notification.isRead && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-background/50 rounded-full"
                            onClick={(e) => {
                                e.stopPropagation();
                                onMarkAsRead(notification.id);
                            }}
                            disabled={isMarkingAsRead}
                        >
                            {isMarkingAsRead ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                            <span className="sr-only">Mark as read</span>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-background/50 rounded-full text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(notification.id);
                        }}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Trash2 className="h-4 w-4" />
                        )}
                        <span className="sr-only">Delete</span>
                    </Button>
                </div>
            </div>

            {/* Unread Indicator Dot */}
            {!notification.isRead && (
                <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-primary animate-pulse sm:hidden" />
            )}
        </div>
    );
}

function NotificationsSkeleton() {
    return (
        <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl bg-muted/20 animate-pulse border border-border/50">
                    <div className="h-10 w-10 rounded-full bg-muted/40 shrink-0" />
                    <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted/40" />
                        <div className="h-3 w-1/4 rounded bg-muted/40" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function WorkerNotifications() {
    const navigate = useNavigate();

    // Get user from RTK Query
    const { data: userData } = useGetCurrentUserQuery();
    const user = userData?.data?.user;

    const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
    const [markingId, setMarkingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const apiUser = user as { role?: string };
    const userRole = apiUser?.role || "worker";

    const { data: notificationsData, isLoading } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const notifications = notificationsData?.data || [];
    const unreadNotifications = notifications.filter((n) => !n.isRead);
    const displayedNotifications =
        activeTab === "unread" ? unreadNotifications : notifications;

    const handleMarkAsRead = async (id: number) => {
        setMarkingId(id);
        try {
            await markAsRead(id).unwrap();
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead().unwrap();
    };

    const handleDelete = async (id: number) => {
        setDeletingId(id);
        try {
            await deleteNotification(id).unwrap();
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
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="p-4">
                    <h1 className="text-3xl font-black font-spline tracking-tight flex items-center gap-3">
                        <Bell className="h-8 w-8 text-primary" />
                        Notifications
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Stay updated on your missions, applications, and payments
                    </p>
                </div>
                {unreadNotifications.length > 0 && (
                    <Button
                        onClick={handleMarkAllAsRead}
                        disabled={isMarkingAllAsRead}
                        className="rounded-full shadow-lg shadow-primary/20"
                    >
                        {isMarkingAllAsRead ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <CheckCheck className="mr-2 h-4 w-4" />
                        )}
                        Mark all as read
                    </Button>
                )}
            </div>

            <Tabs
                value={activeTab}
                onValueChange={(v) => setActiveTab(v as "all" | "unread")}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <TabsList className="bg-muted/50 rounded-full h-11 p-1">
                        <TabsTrigger value="all" className="rounded-full px-6 h-full transition-all">
                            All Notifications
                            <Badge variant="secondary" className="ml-2 bg-background/50 text-foreground text-xs">{notifications.length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="unread" className="rounded-full px-6 h-full transition-all">
                            Unread
                            {unreadNotifications.length > 0 && (
                                <Badge variant="destructive" className="ml-2 text-xs">{unreadNotifications.length}</Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="all" className="space-y-4 mt-0 min-h-[300px]">
                    {isLoading ? (
                        <NotificationsSkeleton />
                    ) : displayedNotifications.length === 0 ? (
                        <EmptyState
                            icon={Bell}
                            title="No notifications"
                            description="You're all caught up! Important updates will appear here."
                        />
                    ) : (
                        <div className="space-y-3">
                            {displayedNotifications.map((notification) => (
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
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="unread" className="space-y-4 mt-0 min-h-[300px]">
                    {isLoading ? (
                        <NotificationsSkeleton />
                    ) : unreadNotifications.length === 0 ? (
                        <EmptyState
                            icon={CheckCheck}
                            title="No unread notifications"
                            description="Great job! You've read all your notifications."
                        />
                    ) : (
                        <div className="space-y-3">
                            {unreadNotifications.map((notification) => (
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
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}
