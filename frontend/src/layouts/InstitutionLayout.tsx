import {
    LayoutDashboard,
    PlusCircle,
    Briefcase,
    ClipboardList,
    CreditCard,
    Star,
    Bell,
    MessageSquare,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";
import { useUnreadMessageCount } from "@/socket/hooks/useUnreadMessageCount";
import { useTranslation } from "react-i18next";

interface InstitutionLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function InstitutionLayout({
    children,
    title,
    description,
}: InstitutionLayoutProps) {
    const unreadCount = useUnreadMessageCount();
    const { t } = useTranslation();

    const institutionNavItems: NavItem[] = [
        {
            label: t("DASHBOARD_NAV.DASHBOARD"),
            href: "/institution",
            icon: LayoutDashboard,
        },
        {
            label: t("DASHBOARD_NAV.CREATE_MISSION"),
            href: "/institution/missions/create",
            icon: PlusCircle,
        },
        {
            label: t("DASHBOARD_NAV.MY_MISSIONS"),
            href: "/institution/missions",
            icon: Briefcase,
        },
        {
            label: t("DASHBOARD_NAV.ASSIGNMENTS"),
            href: "/institution/assignments",
            icon: ClipboardList,
        },
        {
            label: t("DASHBOARD_NAV.MESSAGES"),
            href: "/institution/messages",
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
            label: t("DASHBOARD_NAV.PAYMENTS"),
            href: "/institution/payments/history",
            icon: CreditCard,
        },
        {
            label: t("DASHBOARD_NAV.REVIEWS"),
            href: "/institution/reviews",
            icon: Star,
        },
        {
            label: t("DASHBOARD_NAV.NOTIFICATIONS"),
            href: "/institution/notifications",
            icon: Bell,
        },
    ];

    return (
        <DashboardLayout navItems={institutionNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

