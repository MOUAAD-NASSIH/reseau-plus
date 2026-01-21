import { useState } from "react";
import { Link, useLocation } from "react-router";
import { cn } from "@/lib/utils";
import Logo from "@/assets/Logo";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Settings, LogOut } from "lucide-react";
import type { NavItem } from "@/layouts/DashboardLayout";
import { useTranslation } from "react-i18next";
import { LogoutConfirmDialog } from "@/components/common/LogoutConfirmDialog";

interface DashboardSidebarProps {
    className?: string;
    navItems: NavItem[];
    collapsed: boolean;
    setCollapsed?: (collapsed: boolean) => void;
    onItemClick?: () => void;
    isMobile?: boolean;
    onLogout?: () => void;
    userRole?: string;
}

export function DashboardSidebar({
    className,
    navItems,
    collapsed,
    setCollapsed,
    onItemClick,
    isMobile = false,
    onLogout,
    userRole,
}: DashboardSidebarProps) {
    const location = useLocation();
    const { t } = useTranslation();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);

    // Determine settings path based on role
    const getSettingsPath = () => {
        switch (userRole?.toLowerCase()) {
            case 'worker': return '/worker/profile';
            case 'institution': return '/institution/profile';
            case 'admin': return '/admin/profile';
            default: return '/profile';
        }
    };

    // Check if a nav item is active (exact match or child route)
    const isNavItemActive = (href: string) => {
        const currentPath = location.pathname;

        if (href === currentPath) return true;

        if (href.endsWith("/admin") || href.endsWith("/worker") || href.endsWith("/institution")) {
            return currentPath === href;
        }

        if (currentPath.startsWith(href)) {
            const nextChar = currentPath.charAt(href.length);
            if (href.endsWith("/") || nextChar === "" || nextChar === "/") {
                const isMoreSpecificRouteActive = navItems.some(item => {
                    if (item.href === href) return false;
                    if (item.href.startsWith(href) && item.href.length > href.length) {
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

    const settingsPath = getSettingsPath();
    const isSettingsActive = isNavItemActive(settingsPath);

    return (
        <div className={cn("flex flex-col h-full bg-card border-r border-border", className)}>
            {/* Sidebar Header */}
            <div className={cn(
                "flex items-center h-16 px-4 border-b border-border/50",
                collapsed ? "justify-center" : "justify-between"
            )}>
                <Link to="/" className={cn("flex items-center gap-3 transition-all", collapsed && "justify-center w-full")} onClick={onItemClick}>
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl text-primary bg-primary/10 shrink-0">
                        <Logo />
                    </div>
                    {!collapsed && (
                        <span className="font-bold text-lg font-spline tracking-tight">
                            Réseau+
                        </span>
                    )}
                </Link>

                {!isMobile && setCollapsed && !collapsed && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hidden lg:flex rounded-lg"
                        onClick={() => setCollapsed(!collapsed)}
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                {/* MENU SECTION */}
                <div className="space-y-1">
                    {!collapsed && (
                        <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider font-spline">
                            {t("DASHBOARD_NAV.MENU")}
                        </h4>
                    )}

                    {navItems.map((item) => {
                        const isActive = isNavItemActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                onClick={onItemClick}
                                title={collapsed ? item.label : undefined}
                                className={cn(
                                    "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                                    collapsed ? "justify-center px-2" : "justify-start",
                                    isActive
                                        ? "bg-primary/10 text-primary shadow-sm"
                                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                )}
                            >
                                <Icon className={cn(
                                    "h-[1.15rem] w-[1.15rem] shrink-0 transition-transform duration-300",
                                    !isActive && "group-hover:scale-110",
                                )} />

                                {!collapsed && (
                                    <span className="flex-1 truncate font-medium">
                                        {item.label}
                                    </span>
                                )}

                                {/* Badge */}
                                {item.badge && (
                                    <span className={cn(
                                        "flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-bold rounded-full transition-all",
                                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                                        collapsed && "absolute -top-1 -right-1 min-w-[16px] h-4 text-[9px] border-2 border-card"
                                    )}>
                                        {item.badge}
                                    </span>
                                )}

                                {/* Tooltip for collapsed state */}
                                {collapsed && !isMobile && (
                                    <div className="fixed left-[64px] ml-0 px-3 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-1">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </div>

                {/* ACCOUNT SECTION */}
                <div className="space-y-1">
                    {!collapsed && (
                        <h4 className="px-3 mb-2 text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider font-spline mt-6">
                            {t("DASHBOARD_NAV.ACCOUNT")}
                        </h4>
                    )}

                    {/* Settings Link */}
                    <Link
                        to={settingsPath}
                        onClick={onItemClick}
                        className={cn(
                            "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                            collapsed ? "justify-center px-2" : "justify-start",
                            isSettingsActive
                                ? "bg-primary/10 text-primary shadow-sm"
                                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                        )}
                        title={collapsed ? t("DASHBOARD_NAV.SETTINGS") : undefined}
                    >
                        <Settings className={cn("h-[1.15rem] w-[1.15rem] shrink-0 transition-transform duration-300 group-hover:rotate-45")} />

                        {!collapsed && <span className="flex-1 truncate font-medium">{t("DASHBOARD_NAV.SETTINGS")}</span>}

                        {collapsed && !isMobile && (
                            <div className="fixed left-[64px] ml-0 px-3 py-1.5 bg-popover text-popover-foreground text-xs font-medium rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-1">
                                {t("DASHBOARD_NAV.SETTINGS")}
                            </div>
                        )}
                    </Link>

                    {/* Sign Out Button */}
                    {onLogout && (
                        <>
                            <button
                                onClick={() => setShowLogoutDialog(true)}
                                className={cn(
                                    "group relative flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-red-500 hover:bg-red-500/10 hover:text-red-600",
                                    collapsed ? "justify-center px-2" : "justify-start"
                                )}
                                title={collapsed ? t("DASHBOARD_NAV.SIGN_OUT") : undefined}
                            >
                                <LogOut className="h-[1.15rem] w-[1.15rem] shrink-0" />

                                {!collapsed && <span className="flex-1 truncate font-medium text-left">{t("DASHBOARD_NAV.SIGN_OUT")}</span>}

                                {collapsed && !isMobile && (
                                    <div className="fixed left-[64px] ml-0 px-3 py-1.5 bg-popover text-xs font-medium rounded-md shadow-lg border border-border opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 whitespace-nowrap animate-in fade-in slide-in-from-left-1 text-red-500">
                                        {t("DASHBOARD_NAV.SIGN_OUT")}
                                    </div>
                                )}
                            </button>

                            <LogoutConfirmDialog
                                open={showLogoutDialog}
                                onOpenChange={setShowLogoutDialog}
                                onConfirm={() => {
                                    setShowLogoutDialog(false);
                                    onLogout();
                                }}
                            />
                        </>
                    )}
                </div>
            </div>

            {/* Collapse Button (Bottom) - Only for Desktop when Collapsed */}
            {!isMobile && collapsed && setCollapsed && (
                <div className="p-3 border-t border-border/50 flex justify-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-lg"
                        onClick={() => setCollapsed(!collapsed)}
                        title="Expand sidebar"
                    >
                        <ChevronLeft className="h-4 w-4 rotate-180" />
                    </Button>
                </div>
            )}
        </div>
    );
}
