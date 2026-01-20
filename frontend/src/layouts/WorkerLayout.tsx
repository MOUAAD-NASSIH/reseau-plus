import {
    LayoutDashboard,
    User,
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

interface WorkerLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function WorkerLayout({ children, title, description }: WorkerLayoutProps) {
    const unreadCount = useUnreadMessageCount();

    const workerNavItems: NavItem[] = [
        {
            label: "Dashboard",
            href: "/worker",
            icon: LayoutDashboard,
        },
        {
            label: "Available Missions",
            href: "/worker/missions",
            icon: Briefcase,
        },
        {
            label: "My Applications",
            href: "/worker/applications",
            icon: ClipboardList,
        },
        {
            label: "Assigned Missions",
            href: "/worker/assignments",
            icon: CheckSquare,
        },
        {
            label: "Messages",
            href: "/worker/messages",
            icon: MessageSquare,
            badge: unreadCount > 0 ? unreadCount : undefined,
        },
        {
            label: "Reviews",
            href: "/worker/reviews",
            icon: Star,
        },
        {
            label: "Notifications",
            href: "/worker/notifications",
            icon: Bell,
        },
        {
            label: "Availability",
            href: "/worker/availability",
            icon: Calendar,
        },
        {
            label: "Documents",
            href: "/worker/documents",
            icon: FileText,
        },
        {
            label: "Profile",
            href: "/worker/profile",
            icon: User,
        },
    ];

    return (
        <DashboardLayout navItems={workerNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

