import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Settings, UserCheck, Shield } from "lucide-react";

// Helper to get time-based greeting key suffix
const getGreetingSuffix = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "MORNING";
    if (hour < 18) return "AFTERNOON";
    return "EVENING";
};

export function AdminDashboardHeader() {
    const { t, i18n } = useTranslation();

    const currentDate = new Date().toLocaleDateString(i18n.language, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const greetingSuffix = getGreetingSuffix();

    return (
        <div className="relative bg-card border-b border-border">
            <div className="px-4 py-6 md:py-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-medium text-xs uppercase tracking-wider">
                            <Shield className="size-3" />
                            <span>{t("ADMIN_DASHBOARD.ROLE_LABEL") || "Administrator Portal"}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold font-spline tracking-tight text-foreground">
                            {t(`ADMIN_DASHBOARD.WELCOME.GREETING_${greetingSuffix}`)}, <span className="bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">Admin</span>
                        </h1>
                        <p className="text-muted-foreground font-spline text-base capitalize">
                            {currentDate}
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Placeholder Actions for future admin features */}
                        <Button variant="outline" className="gap-2 h-11 border-primary/20 hover:border-primary/50 hover:bg-primary/5 shadow-sm" asChild>
                            <Link to="/admin/profile">
                                <Settings className="h-4 w-4 text-primary" />
                                <span>{t("ADMIN_DASHBOARD.SETTINGS") || "Settings"}</span>
                            </Link>
                        </Button>
                        <Button className="gap-2 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                            <Link to="/admin/workers">
                                <UserCheck className="h-4 w-4" />
                                <span>{t("ADMIN_DASHBOARD.VALIDATE_USER") || "Validate User"}</span>
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
