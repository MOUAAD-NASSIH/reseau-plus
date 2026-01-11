import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
    Menu,
    X,
    LogOut,
    User,
    ChevronDown,
    ChevronLeft,
    type LucideIcon,
} from "lucide-react";
import Logo from "@/assets/Logo";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { NotificationBell } from "@/components/common/NotificationBell";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/features/hooks";
import { logout } from "@/features/slices/authSlice";
import { useLogoutMutation } from "@/features/api/endpoints/authEndpoints";

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
 * - Workers: { userId, email, role: 'worker', workerId, worker: { firstName, lastName, ... } }
 * - Institutions: { userId, email, role: 'institution', institutionId, institution: { institutionName, ... } }
 * - Admins: { userId, email, role: 'admin' }
 */
interface ApiUser {
    userId?: number;
    email?: string;
    role?: string;
    worker?: {
        firstName?: string;
        lastName?: string;
    };
    institution?: {
        institutionName?: string;
    };
    // Legacy structure support
    firstName?: string;
    lastName?: string;
    institutionName?: string;
}

export default function DashboardLayout({
    children,
    navItems,
    title = "Dashboard",
    description,
}: DashboardLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        // Initialize from localStorage
        if (typeof window !== "undefined") {
            const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
            return stored === "true";
        }
        return false;
    });
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector((s) => s.auth.user);
    const [logoutMutation] = useLogoutMutation();

    // Persist sidebar collapsed state to localStorage
    useEffect(() => {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(sidebarCollapsed));
    }, [sidebarCollapsed]);

    const handleLogout = async () => {
        // Use RTK Query logout mutation which clears cache
        await logoutMutation();
        // Also dispatch Redux logout action for UI state
        dispatch(logout());
        navigate("/login");
    };

    const getUserDisplayName = () => {
        if (!user) return "User";

        const apiUser = user as ApiUser;

        // Handle API response format (nested worker/institution objects)
        if (apiUser.role === "worker") {
            const firstName = apiUser.worker?.firstName || apiUser.firstName;
            const lastName = apiUser.worker?.lastName || apiUser.lastName;
            if (firstName && lastName) {
                return `${firstName} ${lastName}`;
            }
        }

        if (apiUser.role === "institution") {
            const institutionName = apiUser.institution?.institutionName || apiUser.institutionName;
            if (institutionName) {
                return institutionName;
            }
        }

        return apiUser.email || "User";
    };

    const getUserRole = () => {
        if (!user) return "";

        const apiUser = user as ApiUser;

        if (apiUser.role === "worker") return "Worker";
        if (apiUser.role === "institution") return "Institution";
        if (apiUser.role === "admin") return "Admin";

        return "";
    };

    // Check if a nav item is active (exact match or child route)
    // Uses a more precise matching algorithm to avoid false positives
    const isNavItemActive = (href: string) => {
        const currentPath = location.pathname;

        // Exact match always wins
        if (href === currentPath) return true;

        // For dashboard root routes, only exact match
        if (href.endsWith("/admin") || href.endsWith("/worker") || href.endsWith("/institution")) {
            return currentPath === href;
        }

        // For other routes, check if current path starts with href
        // But ensure we're matching complete path segments to avoid
        // /institution/missions matching /institution/missions/create
        if (currentPath.startsWith(href)) {
            // Check if the next character after href is either end of string or a slash
            const nextChar = currentPath.charAt(href.length);
            // If href ends with a slash or the next char is a slash or end of string
            if (href.endsWith("/") || nextChar === "" || nextChar === "/") {
                // Additional check: find the most specific match among all nav items
                // This prevents parent routes from being highlighted when a child is active
                const isMoreSpecificRouteActive = navItems.some(item => {
                    if (item.href === href) return false; // Skip self
                    if (item.href.startsWith(href) && item.href.length > href.length) {
                        // There's a more specific route that starts with this href
                        // Check if current path matches that more specific route
                        if (currentPath.startsWith(item.href)) {
                            const nextCharSpecific = currentPath.charAt(item.href.length);
                            return nextCharSpecific === "" || nextCharSpecific === "/";
                        }
                    }
                    return false;
                });

                return !isMoreSpecificRouteActive;
            }
        }

        return false;
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Mobile sidebar overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity duration-300",
                    sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 bg-card border-r border-border shadow-lg",
                    "transform transition-all duration-300 ease-in-out",
                    "lg:translate-x-0 lg:shadow-none",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    sidebarCollapsed ? "lg:w-18" : "w-64"
                )}
            >
                {/* Sidebar header */}
                <div className={cn(
                    "flex items-center h-16 px-4 border-b border-border bg-card/50 backdrop-blur-sm",
                    sidebarCollapsed ? "lg:justify-center" : "justify-between"
                )}>
                    <Link to="/" className={cn("flex items-center gap-2", sidebarCollapsed && "lg:hidden")}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg text-primary bg-primary/10">
                            <Logo />
                        </div>
                        <span className="inline-block font-semibold text-lg font-spline">
                            Réseau+
                        </span>
                    </Link>
                    <div className={cn(
                        "flex items-center gap-1",
                        sidebarCollapsed && "lg:justify-center"
                    )}>
                        {/* Desktop collapse button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="hidden lg:flex h-8 w-8 hover:bg-primary/10 transition-colors duration-200"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        >
                            <ChevronLeft
                                className={cn(
                                    "h-4 w-4 transition-transform duration-300",
                                    sidebarCollapsed && "rotate-180"
                                )}
                            />
                        </Button>
                        {/* Mobile close button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="lg:hidden h-8 w-8 hover:bg-primary/10 transition-colors duration-200"
                            onClick={() => setSidebarOpen(false)}
                            aria-label="Close sidebar"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className={cn(
                    "p-3 space-y-1",
                    "max-h-[calc(100vh-4rem)]",
                    sidebarCollapsed ? "lg:overflow-hidden lg:flex lg:flex-col lg:items-center" : "overflow-y-auto"
                )}>
                    {navItems.map((item) => {
                        const isActive = isNavItemActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={() => setSidebarOpen(false)}
                                title={sidebarCollapsed ? item.label : undefined}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium",
                                    "transition-all duration-200 ease-in-out",
                                    sidebarCollapsed && "lg:justify-center lg:px-2 lg:w-12",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-primary/10 hover:text-foreground"
                                )}
                            >
                                {/* Active indicator bar */}
                                {isActive && (
                                    <span
                                        className={cn(
                                            "absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary-foreground rounded-r-full",
                                            "transition-all duration-200",
                                            sidebarCollapsed && "lg:hidden"
                                        )}
                                    />
                                )}
                                <Icon className={cn(
                                    "h-5 w-5 shrink-0",
                                    "transition-transform duration-200",
                                    !isActive && "group-hover:scale-110"
                                )} />
                                <span className={cn(
                                    "transition-all duration-300 flex-1",
                                    sidebarCollapsed && "lg:hidden lg:opacity-0 lg:w-0"
                                )}>
                                    {item.label}
                                </span>
                                {/* Badge indicator */}
                                {item.badge && (
                                    <span className={cn(
                                        "flex items-center justify-center px-2 min-w-5 h-5 text-xs font-bold rounded-full",
                                        "transition-all duration-200",
                                        isActive
                                            ? "bg-primary-foreground text-primary"
                                            : "bg-red-500 text-white",
                                        sidebarCollapsed && "lg:absolute lg:top-0 lg:right-0 lg:min-w-4 lg:h-4 lg:text-[10px]"
                                    )}>
                                        {item.badge}
                                    </span>
                                )}
                                {/* Tooltip for collapsed state */}
                                {sidebarCollapsed && (
                                    <span className={cn(
                                        "absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md shadow-lg",
                                        "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                                        "transition-all duration-200 whitespace-nowrap z-50",
                                        "hidden lg:block"
                                    )}>
                                        {item.label}
                                        {item.badge && ` (${item.badge})`}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* Main content area */}
            <div className={cn(
                "transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "lg:pl-18" : "lg:pl-64"
            )}>
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 bg-card/95 backdrop-blur-sm border-b border-border shadow-sm">
                    <div className="flex items-center justify-between h-full px-4 md:px-6">
                        {/* Left side - mobile menu button and title */}
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden h-9 w-9 hover:bg-primary/10 transition-colors duration-200"
                                onClick={() => setSidebarOpen(true)}
                                aria-label="Open sidebar menu"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                            <div className="flex flex-col">
                                <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
                                {description && (
                                    <p className="text-sm text-muted-foreground hidden sm:block">{description}</p>
                                )}
                            </div>
                        </div>

                        {/* Right side - notifications, theme, user menu */}
                        <div className="flex items-center gap-1 md:gap-2">
                            {/* Notification bell */}
                            <NotificationBell />

                            {/* Theme toggle */}
                            <ThemeToggle />

                            {/* User menu */}
                            <div className="relative ml-1">
                                <Button
                                    variant="ghost"
                                    className={cn(
                                        "flex items-center gap-2 px-2 h-10",
                                        "hover:bg-primary/10 transition-colors duration-200"
                                    )}
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                >
                                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
                                        <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="hidden md:block text-left">
                                        <p className="text-sm font-medium leading-tight">{getUserDisplayName()}</p>
                                        <p className="text-xs text-muted-foreground">{getUserRole()}</p>
                                    </div>
                                    <ChevronDown className={cn(
                                        "h-4 w-4 text-muted-foreground transition-transform duration-200",
                                        userMenuOpen && "rotate-180"
                                    )} />
                                </Button>

                                {/* Dropdown menu */}
                                <div
                                    className={cn(
                                        "absolute right-0 mt-2 w-48 bg-card rounded-lg border border-border shadow-lg z-50",
                                        "transition-all duration-200 origin-top-right",
                                        userMenuOpen
                                            ? "opacity-100 scale-100 visible"
                                            : "opacity-0 scale-95 invisible"
                                    )}
                                >
                                    <div className="p-2">
                                        <button
                                            onClick={handleLogout}
                                            className={cn(
                                                "flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive rounded-md",
                                                "hover:bg-destructive/10 transition-colors duration-200"
                                            )}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out
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

                {/* Page content */}
                <main className="p-4 md:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}

