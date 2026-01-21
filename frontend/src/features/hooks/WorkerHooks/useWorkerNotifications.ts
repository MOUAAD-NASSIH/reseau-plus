import { useState } from "react";
import { useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import {
    useGetNotificationsQuery,
    useMarkAsReadMutation,
    useMarkAllAsReadMutation,
    useDeleteNotificationMutation,
} from "@/features/api/endpoints/notificationEndpoints";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { getNotificationRedirectUrl } from "@/utils/notificationUtils";
import type { NotificationType } from "@/types/notification.types";
import {
    Bell,
    CheckCircle2,
    XCircle,
    DollarSign,
    AlertCircle,
    ShieldCheck,
    ShieldAlert,
    FileCheck,
    FileX,
    Star,
    ClipboardList,
    Briefcase,
} from "lucide-react";

/**
 * Notification Metadata for visual cues - Worker specific
 */
export const WORKER_NOTIFICATION_METADATA: Record<NotificationType, { icon: any; color: string; category: string }> = {
    // Mission Applications
    APPLICATION_SUBMITTED: { icon: ClipboardList, color: "text-blue-500 bg-blue-500/10", category: "MISSIONS" },
    APPLICATION_ACCEPTED: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10", category: "MISSIONS" },
    APPLICATION_REJECTED: { icon: XCircle, color: "text-red-500 bg-red-500/10", category: "MISSIONS" },

    // Assignments
    ASSIGNMENT_CREATED: { icon: Briefcase, color: "text-cyan-500 bg-cyan-500/10", category: "MISSIONS" },
    ASSIGNMENT_ACTIVE: { icon: CheckCircle2, color: "text-blue-500 bg-blue-500/10", category: "MISSIONS" },
    ASSIGNMENT_ONGOING: { icon: Briefcase, color: "text-amber-500 bg-amber-500/10", category: "MISSIONS" },
    ASSIGNMENT_COMPLETED: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10", category: "MISSIONS" },
    ASSIGNMENT_CANCELLED: { icon: XCircle, color: "text-red-500 bg-red-500/10", category: "MISSIONS" },

    // Payments
    PAYMENT_RECEIVED: { icon: DollarSign, color: "text-emerald-500 bg-emerald-500/10", category: "PAYMENTS" },
    PAYMENT_FAILED: { icon: AlertCircle, color: "text-red-500 bg-red-500/10", category: "PAYMENTS" },
    PAYMENT_COMPLETED: { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-500/10", category: "PAYMENTS" },

    // System / Profile
    WORKER_VERIFIED: { icon: ShieldCheck, color: "text-emerald-500 bg-emerald-500/10", category: "SYSTEM" },
    WORKER_REJECTED: { icon: ShieldAlert, color: "text-red-500 bg-red-500/10", category: "SYSTEM" },
    DOCUMENT_APPROVED: { icon: FileCheck, color: "text-emerald-500 bg-emerald-500/10", category: "SYSTEM" },
    DOCUMENT_REJECTED: { icon: FileX, color: "text-red-500 bg-red-500/10", category: "SYSTEM" },
    REVIEW_RECEIVED: { icon: Star, color: "text-amber-500 bg-amber-500/10", category: "SYSTEM" },

    // Fallback
    GENERAL: { icon: Bell, color: "text-slate-500 bg-slate-500/10", category: "SYSTEM" },
};

export const useWorkerNotifications = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("ALL");

    const { data: notificationsData, isLoading } = useGetNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [markAllAsRead] = useMarkAllAsReadMutation();
    const [deleteNotification] = useDeleteNotificationMutation();

    const notifications = notificationsData?.data || [];
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    // Filter notifications based on tab
    const filteredNotifications = notifications.filter((n) => {
        if (activeTab === "ALL") return true;
        if (activeTab === "UNREAD") return !n.isRead;
        const meta = WORKER_NOTIFICATION_METADATA[n.type];
        return meta?.category === activeTab;
    });

    const handleMarkAsRead = async (id: number) => {
        try {
            await markAsRead(id).unwrap();
        } catch (error) {
            showErrorToast(error, "Failed to mark as read");
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await markAllAsRead().unwrap();
            showSuccessToast(t("COMMON.SUCCESS"));
        } catch (error) {
            showErrorToast(error, "Failed to mark all as read");
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteNotification(id).unwrap();
        } catch (error) {
            showErrorToast(error, "Failed to delete notification");
        }
    };

    const getRedirectUrl = (notification: { type: NotificationType, entityId?: number, entityType?: string }): string | null => {
        return getNotificationRedirectUrl(notification as any, "worker");
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

    return {
        t,
        navigate,
        activeTab,
        setActiveTab,
        isLoading,
        notifications,
        filteredNotifications,
        unreadCount,
        handleMarkAsRead,
        handleMarkAllAsRead,
        handleDelete,
        getRedirectUrl,
        formatDate,
    };
};
