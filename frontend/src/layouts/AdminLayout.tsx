import {
    LayoutDashboard,
    UserCheck,
    FileCheck,
    Layers,
    Tags,
    Briefcase,
    ClipboardList,
    CreditCard,
    Star,
    ScrollText,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";
import { useTranslation } from "react-i18next";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
    const { t } = useTranslation();

    const adminNavItems: NavItem[] = [
        {
            label: t("DASHBOARD_NAV.DASHBOARD"),
            href: "/admin",
            icon: LayoutDashboard,
        },
        {
            label: t("DASHBOARD_NAV.WORKERS_VALIDATION"),
            href: "/admin/workers",
            icon: UserCheck,
        },
        {
            label: t("DASHBOARD_NAV.DOCUMENTS_VALIDATION"),
            href: "/admin/documents",
            icon: FileCheck,
        },
        {
            label: t("DASHBOARD_NAV.DOMAINS"),
            href: "/admin/domains",
            icon: Layers,
        },
        {
            label: t("DASHBOARD_NAV.SPECIALITIES"),
            href: "/admin/specialities",
            icon: Tags,
        },
        {
            label: t("DASHBOARD_NAV.MISSIONS_OVERVIEW"),
            href: "/admin/missions",
            icon: Briefcase,
        },
        {
            label: t("DASHBOARD_NAV.ASSIGNMENTS_OVERVIEW"),
            href: "/admin/assignments",
            icon: ClipboardList,
        },
        {
            label: t("DASHBOARD_NAV.PAYMENTS_OVERVIEW"),
            href: "/admin/payments",
            icon: CreditCard,
        },
        {
            label: t("DASHBOARD_NAV.REVIEWS_OVERVIEW"),
            href: "/admin/reviews",
            icon: Star,
        },
        {
            label: t("DASHBOARD_NAV.ADMIN_LOGS"),
            href: "/admin/logs",
            icon: ScrollText,
        },
    ];

    return (
        <DashboardLayout navItems={adminNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

