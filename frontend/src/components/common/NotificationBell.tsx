/**
 * NotificationBell - bell icon with unread count and dropdown for recent notifications
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Bell, CheckCheck, Loader2, ExternalLink, WifiOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
    useGetNotificationsQuery,
    useGetUnreadNotificationCountQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
} from "@/features/api/endpoints/notificationEndpoints";
import type { Notification, NotificationType } from "@/types/notification.types";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";
import { useNotificationSocket } from "@/socket/hooks/useNotificationSocket";

interface ApiUser {
    role?: string;
}

const getNotificationRedirectUrl = (type: NotificationType, role: string): string | null => {
    switch (type) {
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
            return role === "worker" ? "/worker/assignments" : "/institution/payments";
        case "PAYMENT_FAILED":
            return role === "institution" ? "/institution/payments" : null;
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

const getNotificationStyle = (type: NotificationType): { color: string; bgColor: string } => {
    switch (type) {
        case "APPLICATION_ACCEPTED":
        case "WORKER_VERIFIED":
        case "DOCUMENT_APPROVED":
        case "PAYMENT_RECEIVED":
        case "ASSIGNMENT_COMPLETED":
            return { color: "text-success", bgColor: "bg-success/10" };
        case "APPLICATION_REJECTED":
        case "WORKER_REJECTED":
        case "DOCUMENT_REJECTED":
        case "PAYMENT_FAILED":
        case "ASSIGNMENT_CANCELLED":
            return { color: "text-destructive", bgColor: "bg-destructive/10" };
        case "APPLICATION_SUBMITTED":
        case "ASSIGNMENT_CREATED":
        case "REVIEW_RECEIVED":
            return { color: "text-info", bgColor: "bg-info/10" };
        default:
            return { color: "text-muted-foreground", bgColor: "bg-muted" };
    }
};

const formatTimestamp = (dateString: string): string => {
    try {
        return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
        return "Unknown time";
    }
};

interface NotificationItemProps {
    notification: Notification;
    onMarkAsRead: (id: number) => void;
    onNavigate: (notification: Notification) => void;
    isMarking: boolean;
    userRole: string;
}

function NotificationItem({ notification, onMarkAsRead, onNavigate, isMarking, userRole }: NotificationItemProps) {
    const style = getNotificationStyle(notification.type);
    const redirectUrl = getNotificationRedirectUrl(notification.type, userRole);

    const handleClick = () => {
        if (!notification.isRead) {
            onMarkAsRead(notification.id);
        }
        onNavigate(notification);
    };

    return (
        <div
            className={cn(
                "flex flex-col gap-2 p-3 cursor-pointer rounded-md mx-1 transition-colors",
                "hover:bg-accent/50",
                !notification.isRead && "bg-primary/5 border-l-2 border-l-primary"
            )}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    handleClick();
                }
            }}
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className={cn("w-2 h-2 rounded-full mt-2 shrink-0", style.bgColor)} />
                    <p className={cn("text-sm flex-1", style.color)}>
                        {notification.message}
                    </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    {!notification.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                    )}
                    {isMarking && (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    )}
                    {redirectUrl && (
                        <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    )}
                </div>
            </div>
            <span className="text-xs text-muted-foreground pl-4">
                {formatTimestamp(notification.createdAt)}
            </span>
        </div>
    );
}

function NotificationSkeleton() {
    return (
        <div className="p-3 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

export function NotificationBell() {
    const navigate = useNavigate();

    // Get user from RTK Query
    const { data: userData } = useGetCurrentUserQuery();
    const user = userData?.data?.user;

    const [markingId, setMarkingId] = useState<number | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const previousUnreadCount = useRef<number>(0);

    const apiUser = user as ApiUser;
    const userRole = apiUser?.role || "";

    const { isConnected } = useNotificationSocket();

    const { data: unreadCountData } = useGetUnreadNotificationCountQuery();
    const unreadCount = unreadCountData?.data?.count ?? 0;

    const { data: notificationsData, isLoading, refetch: refetchNotifications } = useGetNotificationsQuery({ limit: 5 });
    const notifications = notificationsData?.data ?? [];

    useEffect(() => {
        if (unreadCount > previousUnreadCount.current) {
            refetchNotifications();
        }
        previousUnreadCount.current = unreadCount;
    }, [unreadCount, refetchNotifications]);

    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead, { isLoading: isMarkingAllAsRead }] = useMarkAllAsReadMutation();

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

    const handleNotificationClick = (notification: Notification) => {
        const redirectUrl = getNotificationRedirectUrl(notification.type, userRole);
        setIsOpen(false);
        if (redirectUrl) {
            navigate(redirectUrl);
        }
    };

    const handleViewAll = () => {
        setIsOpen(false);
        if (user) {
            if (userRole === "worker") {
                navigate("/worker/notifications");
            } else if (userRole === "institution") {
                navigate("/institution/notifications");
            } else {
                navigate("/admin");
            }
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium flex items-center justify-center animate-pulse">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                    {!isConnected && (
                        <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-warning flex items-center justify-center" title="Real-time updates unavailable">
                            <WifiOff className="h-2 w-2 text-warning-foreground" />
                        </span>
                    )}
                    <span className="sr-only">
                        {unreadCount > 0
                            ? `${unreadCount} unread notifications`
                            : "No unread notifications"}
                        {!isConnected ? " (offline mode)" : ""}
                    </span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
                <DropdownMenuLabel className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span className="font-semibold">Notifications</span>
                        {unreadCount > 0 && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {unreadCount} new
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 text-xs hover:bg-primary/10"
                            onClick={handleMarkAllAsRead}
                            disabled={isMarkingAllAsRead}
                        >
                            {isMarkingAllAsRead ? (
                                <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            ) : (
                                <CheckCheck className="h-3 w-3 mr-1" />
                            )}
                            Mark all read
                        </Button>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />

                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="p-2 space-y-2">
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                            <NotificationSkeleton />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-6 text-center">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                <Bell className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium">No notifications yet</p>
                            <p className="text-xs text-muted-foreground mt-1">
                                We'll notify you when something happens
                            </p>
                        </div>
                    ) : (
                        <div className="py-1 space-y-1">
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={handleMarkAsRead}
                                    onNavigate={handleNotificationClick}
                                    isMarking={markingId === notification.id}
                                    userRole={userRole}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <DropdownMenuSeparator />
                <div className="p-2">
                    <Button
                        variant="ghost"
                        className="w-full justify-center text-primary hover:text-primary hover:bg-primary/10"
                        onClick={handleViewAll}
                    >
                        View all notifications
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

