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
} from "lucide-react";
import DashboardLayout, { type NavItem } from "./DashboardLayout";

interface WorkerLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

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

export default function WorkerLayout({ children, title, description }: WorkerLayoutProps) {
    return (
        <DashboardLayout navItems={workerNavItems} title={title} description={description}>
            {children}
        </DashboardLayout>
    );
}

