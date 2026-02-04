import {
    LayoutDashboard,
    FileText,
    Calendar,
    Briefcase,
    ClipboardList,
    CheckSquare,
    Star,
    Bell,
    MessageSquare,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";
import { useUnreadMessageCount } from "@/socket/hooks/useUnreadMessageCount";
import { useTranslation } from "react-i18next";

interface WorkerLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function WorkerLayout({ children, title, description }: WorkerLayoutProps) {
    const unreadCount = useUnreadMessageCount();
    const { t } = useTranslation();

    const workerNavItems: NavItem[] = [
        {
            label: t("DASHBOARD_NAV.DASHBOARD"),
            href: "/worker",
            icon: LayoutDashboard,
        },
        {
            label: t("DASHBOARD_NAV.AVAILABLE_MISSIONS"),
            href: "/worker/missions",
            icon: Briefcase,
        },
        {
            label: t("DASHBOARD_NAV.MY_APPLICATIONS"),
            href: "/worker/applications",
            icon: ClipboardList,
        },
        {
            label: t("DASHBOARD_NAV.ASSIGNED_MISSIONS"),
            href: "/worker/assignments",
            icon: CheckSquare,
        },
        {
            label: t("DASHBOARD_NAV.MESSAGES"),
            href: "/worker/messages",
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
            label: t("DASHBOARD_NAV.REVIEWS"),
            href: "/worker/reviews",
            icon: Star,
        },
        {
            label: t("DASHBOARD_NAV.NOTIFICATIONS"),
            href: "/worker/notifications",
            icon: Bell,
        },
        {
            label: t("DASHBOARD_NAV.AVAILABILITY"),
            href: "/worker/availability",
            icon: Calendar,
        },
        {
            label: t("DASHBOARD_NAV.DOCUMENTS"),
            href: "/worker/documents",
            icon: FileText,
        },
    ];

    return (
        <DashboardLayout navItems={workerNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

