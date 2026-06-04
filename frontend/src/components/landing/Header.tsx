import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Menu, LayoutDashboard, ChevronDown, Briefcase, Building2 } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "@/assets/Logo";
import { useTranslation } from "react-i18next";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useGetCurrentUserQuery } from "@/features/api/endpoints/authEndpoints";

const DashboardButton = ({
    className,
    variant = "ghost",
    dashboardPath
}: {
    className?: string;
    variant?: "ghost" | "default" | "outline";
    dashboardPath: string;
}) => (
    <Button variant={variant} asChild className={className}>
        <Link to={dashboardPath} className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
        </Link>
    </Button>
);

export function Header() {
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const { t } = useTranslation();

    // Get user data from RTK Query
    const { data: userData } = useGetCurrentUserQuery(undefined, {
        skip: !localStorage.getItem("auth_token"),
    });
    const user = userData?.data?.user;
    const isAuthenticated = !!user;

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isLanding = location.pathname === "/";

    const navLinks = [
        { label: t("NAV.FEATURES"), href: "#features" },
        { label: t("NAV.HOW_IT_WORKS"), href: "#how-it-works" },
    ];

    const scrollToSection = (id: string) => {
        if (!isLanding) return;
        const element = document.querySelector(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth" });
        }
    };

    const getDashboardPath = () => {
        switch (user?.role) {
            case "worker":
                return "/worker";
            case "institution":
                return "/institution";
            case "admin":
                return "/admin";
            default:
                return "/";
        }
    };

    const dashboardPath = getDashboardPath();

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
                ? "border-b bg-background/80 backdrop-blur-md shadow-sm"
                : "bg-transparent border-b border-transparent"
                }`}
        >
            <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="flex h-10 w-10 font-spline items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Logo />
                    </div>
                    <span className="font-bold text-xl tracking-tight hidden sm:inline-block">
                        {t("BRAND.NAME")}
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden items-center gap-8 md:flex">
                    {isLanding && navLinks.map((link) => (
                        <button
                            key={link.label}
                            onClick={() => scrollToSection(link.href)}
                            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                        >
                            {link.label}
                        </button>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="hidden items-center gap-4 md:flex">
                    <LanguageSwitcher />
                    <ThemeToggle />
                    <div className="flex items-center gap-2 pl-2 border-l">
                        {isAuthenticated ? (
                            <DashboardButton
                                variant="default"
                                className="shadow-md hover:shadow-lg transition-all"
                                dashboardPath={dashboardPath}
                            />
                        ) : (
                            <>
                                <Button variant="ghost" asChild className="font-medium">
                                    <Link to="/login">{t("NAV.SIGN_IN")}</Link>
                                </Button>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button className="rounded-full px-6 shadow-md hover:shadow-lg transition-all gap-2 group">
                                            {t("NAV.REGISTER.LABEL")}
                                            <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 p-2 space-y-1">
                                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-primary/10 dark:focus:bg-emerald-500/10">
                                            <Link to="/register/worker" className="flex items-start gap-3 p-2">
                                                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary dark:bg-emerald-500/20 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Briefcase className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-sm">{t("NAV.REGISTER.WORKER")}</span>
                                                    <span className="text-xs text-muted-foreground">{t("NAV.REGISTER.WORKER_DESC")}</span>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild className="cursor-pointer focus:bg-orange-500/10 dark:focus:bg-orange-500/10">
                                            <Link to="/register/institution" className="flex items-start gap-3 p-2">
                                                <div className="h-8 w-8 rounded-full bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 flex items-center justify-center shrink-0 mt-0.5">
                                                    <Building2 className="h-4 w-4" />
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold text-sm">{t("NAV.REGISTER.INSTITUTION")}</span>
                                                    <span className="text-xs text-muted-foreground">{t("NAV.REGISTER.INSTITUTION_DESC")}</span>
                                                </div>
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                    </div>
                </div>

                {/* Mobile Menu (Sheet) */}
                <div className="flex items-center gap-2 md:hidden">
                    <LanguageSwitcher />
                    <ThemeToggle />

                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label="Toggle menu">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right">
                            <SheetHeader className="pb-6 border-b text-left">
                                <SheetTitle className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                        <Logo />
                                    </div>
                                    <span className="font-spline">{t("BRAND.NAME")}</span>
                                </SheetTitle>
                                <SheetDescription>
                                    {t("BRAND.TAGLINE")}
                                </SheetDescription>
                            </SheetHeader>
                            <nav className="flex flex-col gap-4 mt-6">
                                {isLanding && navLinks.map((link) => (
                                    <button
                                        key={link.label}
                                        onClick={() => scrollToSection(link.href)}
                                        className="text-left text-sm font-medium text-muted-foreground hover:text-foreground py-2 border-b border-border/50"
                                    >
                                        {link.label}
                                    </button>
                                ))}

                                <div className="flex flex-col gap-3 mt-4">
                                    {isAuthenticated ? (
                                        <DashboardButton
                                            variant="default"
                                            className="w-full justify-center"
                                            dashboardPath={dashboardPath}
                                        />
                                    ) : (
                                        <>
                                            <Button variant="outline" asChild className="w-full justify-center">
                                                <Link to="/login">{t("NAV.SIGN_IN")}</Link>
                                            </Button>

                                            <div className="grid grid-cols-1 gap-2 pt-2">
                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                                                    {t("NAV.REGISTER.LABEL")}
                                                </p>
                                                <Button asChild className="w-full justify-start h-auto py-3 px-4 bg-primary/10 text-primary hover:bg-primary/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 border-0 shadow-none">
                                                    <Link to="/register/worker" className="flex items-center gap-3">
                                                        <Briefcase className="h-4 w-4" />
                                                        <div className="flex flex-col items-start">
                                                            <span>{t("NAV.REGISTER.WORKER")}</span>
                                                            <span className="text-[10px] opacity-80 font-normal">{t("NAV.REGISTER.WORKER_DESC")}</span>
                                                        </div>
                                                    </Link>
                                                </Button>
                                                <Button asChild className="w-full justify-start h-auto py-3 px-4 bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400 dark:hover:bg-orange-500/20 border-0 shadow-none">
                                                    <Link to="/register/institution" className="flex items-center gap-3">
                                                        <Building2 className="h-4 w-4" />
                                                        <div className="flex flex-col items-start">
                                                            <span>{t("NAV.REGISTER.INSTITUTION")}</span>
                                                            <span className="text-[10px] opacity-80 font-normal">{t("NAV.REGISTER.INSTITUTION_DESC")}</span>
                                                        </div>
                                                    </Link>
                                                </Button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
