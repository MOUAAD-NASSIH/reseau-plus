import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import {
    Menu,
    LogOut,
    ChevronDown,
    Settings,
    type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBell } from "@/components/common/NotificationBell";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { UserAvatar } from "@/components/ui/avatar";
import { ConnectionStatusIndicator } from "@/components/common/ConnectionStatusIndicator";
import { Button } from "@/components/ui/button";
import { useGetCurrentUserQuery, useLogoutMutation } from "@/features/api/endpoints/authEndpoints";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { useTranslation } from "react-i18next";
import { LogoutConfirmDialog } from "@/components/common/LogoutConfirmDialog";

// Key for persisting sidebar collapsed state
const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export interface NavItem {
    label: string;
    href: string;
    icon: LucideIcon;
    badge?: number | string;
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    navItems: NavItem[];
    title?: string;
    description?: string;
}

/**
 * API response structure from /auth/me endpoint:
 * - Workers: { userId, email, role: 'worker', workerId, worker: { firstName, lastName, profilePicture, ... } }
 * - Institutions: { userId, email, role: 'institution', institutionId, institution: { institutionName, logo, ... } }
 * - Admins: { userId, email, role: 'admin' }
 */
interface ApiUser {
    userId?: number;
    email?: string;
    role?: string;
    worker?: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string | null;
    };
    institution?: {
        institutionName?: string;
        logo?: string | null;
    };
}

export default function DashboardLayout({
    children,
    navItems,
    title = "HEADER_TITLES.DASHBOARD",
    description,
}: DashboardLayoutProps) {
    const { t } = useTranslation();
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        // Initialize from localStorage
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
            return stored === "true";
        }
        return false;
    });
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const navigate = useNavigate();

    // Get user data from RTK Query (single source of truth)
    const { data: userData } = useGetCurrentUserQuery();
    const user = userData?.data?.user;

    const [logoutMutation] = useLogoutMutation();

    // Persist sidebar collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const handleLogout = async () => {
        // Use RTK Query logout mutation which clears cache
        await logoutMutation();
        navigate("/login");
    };

    // Get settings path based on user role
    const getSettingsPath = () => {
        const apiUser = user as ApiUser;
        switch (apiUser?.role?.toLowerCase()) {
            case 'worker': return '/worker/profile';
            case 'institution': return '/institution/profile';
            case 'admin': return '/admin/profile';
            default: return '/profile';
        }
    };

    const getUserDisplayName = () => {
        if (!user) return "User";

        const apiUser = user as ApiUser;

        if (apiUser.role === "worker" && apiUser.worker) {
            const { firstName, lastName } = apiUser.worker;
            if (firstName && lastName) {
                return `${firstName} ${lastName}`;
            }
        }

        if (apiUser.role === "institution" && apiUser.institution?.institutionName) {
            return apiUser.institution.institutionName;
        }

        return apiUser.email || "User";
    };

    const getUserRole = () => {
        if (!user) return "";

        const apiUser = user as ApiUser;
        const role = apiUser.role?.toUpperCase();

        if (role === "WORKER" || role === "INSTITUTION" || role === "ADMIN") {
            return t(`ROLES.${role}`);
        }

        return apiUser.role || "";
    };

    const getUserProfilePicture = (): string | null => {
        if (!user) return null;

        const apiUser = user as any;

        // Check for profilePicture at the user level
        if (apiUser.profilePicture) {
            return apiUser.profilePicture;
        }

        // Check nested user object (from /workers/me endpoint)
        if (apiUser.user?.profilePicture) {
            return apiUser.user.profilePicture;
        }

        // Fallback to nested worker object
        if (apiUser.role === "worker" && apiUser.worker?.profilePicture) {
            return apiUser.worker.profilePicture;
        }

        // Institution logo
        if (apiUser.role === "institution" && apiUser.institution?.logo) {
            return apiUser.institution.logo;
        }

        return null;
    };

    return (
        <div className="min-h-screen bg-background/95">
            {/* Mobile Sidebar (Sheet) */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetContent side="left" className="p-0 w-70 border-r-0">
                    <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                    <SheetDescription className="sr-only">Navigation menu for mobile devices</SheetDescription>
                    <DashboardSidebar
                        navItems={navItems}
                        collapsed={false}
                        isMobile={true}
                        onItemClick={() => setMobileMenuOpen(false)}
                        onLogout={handleLogout}
                        userRole={(user as ApiUser)?.role}
                    />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    "hidden lg:block fixed inset-y-0 left-0 z-40 bg-card border-r border-border shadow-sm",
                    "transition-all duration-300 ease-in-out",
                    sidebarCollapsed ? "w-18" : "w-72"
                )}
            >
                <DashboardSidebar
                    navItems={navItems}
                    collapsed={sidebarCollapsed}
                    setCollapsed={setSidebarCollapsed}
                    onLogout={handleLogout}
                    userRole={(user as ApiUser)?.role}
                />
            </aside>

            {/* Main content area */}
            <div className={cn(
                "transition-all duration-300 ease-in-out min-h-screen flex flex-col",
                sidebarCollapsed ? "lg:pl-18" : "lg:pl-72"
            )}>
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 w-full bg-background/80 backdrop-blur-md border-b border-border supports-backdrop-filter:bg-background/60">
                    <div className="flex items-center justify-between h-full px-4 md:px-6">
                        {/* Left side - mobile menu button and title */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-9 w-9 hover:bg-primary/10 transition-colors"
                                onClick={() => setMobileMenuOpen(true)}
                                aria-label="Open sidebar menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>

                            <div
                                key={title + t(title)} // Trigger animation on title/language change
                                className="flex flex-col animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                                <h1 className="text-lg font-bold tracking-tight text-foreground transition-all duration-300">{t(title)}</h1>
                                {description && (
                                    <p className="text-xs text-muted-foreground hidden sm:block font-medium transition-all duration-300">{t(description)}</p>
                                )}
                            </div>
                        </div>

                        {/* Right side - notifications, theme, user menu */}
                        <div className="flex items-center gap-1.5 md:gap-3">
                            <div className="hidden sm:block">
                                <LanguageSwitcher />
                            </div>

                            {/* Notification bell */}
                            <NotificationBell />

                            {/* Theme toggle */}
                            <ThemeToggle />

                            {/* User menu */}
                            <div className="relative ml-1">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "flex items-center gap-2 pl-2 pr-2 h-10 rounded-full",
                                        "hover:bg-accent transition-colors duration-200 border border-transparent hover:border-border"
                                    )}
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <UserAvatar
                                        src={getUserProfilePicture()}
                                        name={getUserDisplayName()}
                                        size="sm"
                                        className="ring-2 ring-background border border-border"
                                    />
                                    <div className="hidden md:block text-left mr-1">
                                        <p className="text-sm font-semibold leading-none">{getUserDisplayName()}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mt-0.5">{getUserRole()}</p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                        userMenuOpen && "rotate-180"
                                    )} />
                                </Button>

                                {/* Dropdown menu */}
                                <div
                                    className={cn(
                                        "absolute right-0 mt-2 w-56 bg-card rounded-xl border border-border shadow-lg shadow-black/5 z-50",
                                        "transition-all duration-200 origin-top-right ring-1 ring-black/5",
                                        userMenuOpen
                                            ? "opacity-100 scale-100 visible translate-y-0"
                                            : "opacity-0 scale-95 invisible -translate-y-2"
                                    )}
                                >
                                    <div className="p-2 space-y-1">
                                        {/* Settings Link */}
                                        <Link
                                            to={getSettingsPath()}
                                            onClick={() => setUserMenuOpen(false)}
                                            className={cn(
                                                "flex items-center gap-2 w-full px-3 py-2 text-sm font-medium rounded-lg",
                                                "hover:bg-muted transition-colors duration-200"
                                            )}
                                        >
                                            <Settings className="h-4 w-4" />
                                            {t("DASHBOARD_NAV.SETTINGS")}
                                        </Link>

                                        {/* Sign Out Button */}
                                        <button
                                            onClick={() => {
                                                setUserMenuOpen(false);
                                                setShowLogoutDialog(true);
                                            }}
                                            className={cn(
                                                "flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive font-medium rounded-lg",
                                                "hover:bg-destructive/10 transition-colors duration-200"
                                            )}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            {t("DASHBOARD_NAV.SIGN_OUT")}
                                        </button>
                                    </div>
                                </div>
                                {/* Backdrop for closing menu */}
                                {userMenuOpen && (
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setUserMenuOpen(false)}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page content - Wrapped in max-width container for larger screens */}
                <main className="flex-1 p-4 md:p-6 lg:p-8 w-full max-w-400 mx-auto animate-in fade-in duration-500">
                    {children}
                </main>
            </div>

            {/* Logout Confirmation Dialog */}
            <LogoutConfirmDialog
                open={showLogoutDialog}
                onOpenChange={setShowLogoutDialog}
                onConfirm={() => {
                    setShowLogoutDialog(false);
                    handleLogout();
                }}
            />

            {/* Connection status indicator */}
            <ConnectionStatusIndicator />
        </div>
    );
}
