import {
    LayoutDashboard,
    Building2,
    PlusCircle,
    Briefcase,
    ClipboardList,
    CreditCard,
    Star,
    Bell,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";

interface InstitutionLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

const institutionNavItems: NavItem[] = [
    {
        label: "Dashboard",
        href: "/institution",
        icon: LayoutDashboard,
    },
    {
        label: "Create Mission",
        href: "/institution/missions/create",
        icon: PlusCircle,
    },
    {
        label: "My Missions",
        href: "/institution/missions",
        icon: Briefcase,
    },
    {
        label: "Assignments",
        href: "/institution/assignments",
        icon: ClipboardList,
    },
    {
        label: "Payments",
        href: "/institution/payments/history",
        icon: CreditCard,
    },
    {
        label: "Reviews",
        href: "/institution/reviews",
        icon: Star,
    },
    {
        label: "Notifications",
        href: "/institution/notifications",
        icon: Bell,
    },
    {
        label: "Profile",
        href: "/institution/profile",
        icon: Building2,
    },
];

export default function InstitutionLayout({
    children,
    title,
    description,
}: InstitutionLayoutProps) {
    return (
        <DashboardLayout navItems={institutionNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

