import {
    LayoutDashboard,
    Building2,
    PlusCircle,
    Briefcase,
    ClipboardList,
    CreditCard,
    Star,
    Bell,
    MessageSquare,
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";
import { useUnreadMessageCount } from "@/hooks/useUnreadMessageCount";

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
            label: "Messages",
            href: "/institution/messages",
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined,
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

    return (
        <DashboardLayout navItems={institutionNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

