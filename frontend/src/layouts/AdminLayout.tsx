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
    User,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const adminNavItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        label: "Workers Validation",
        href: "/admin/workers",
        icon: UserCheck,
    },
    {
        label: "Documents Validation",
        href: "/admin/documents",
        icon: FileCheck,
    },
    {
        label: "Domains",
        href: "/admin/domains",
        icon: Layers,
    },
    {
        label: "Specialities",
        href: "/admin/specialities",
        icon: Tags,
    },
    {
        label: "Missions Overview",
        href: "/admin/missions",
        icon: Briefcase,
    },
    {
        label: "Assignments Overview",
        href: "/admin/assignments",
        icon: ClipboardList,
    },
    {
        label: "Payments Overview",
        href: "/admin/payments",
        icon: CreditCard,
    },
    {
        label: "Reviews Overview",
        href: "/admin/reviews",
        icon: Star,
    },
    {
        label: "Admin Logs",
        href: "/admin/logs",
        icon: ScrollText,
    },
    {
        label: "Profile",
        href: "/admin/profile",
        icon: User,
    },
];

export default function AdminLayout({ children, title, description }: AdminLayoutProps) {
    return (
        <DashboardLayout navItems={adminNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

