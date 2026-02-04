import { Link } from "react-router";
import { Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { Institution } from "@/types/auth.types";
import { useTranslation } from "react-i18next";

interface DashboardHeaderProps {
    institution?: Institution;
    isLoading: boolean;
}

// Helper to get time-based greeting key suffix
const getGreetingSuffix = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "MORNING";
    if (hour < 18) return "AFTERNOON";
    return "EVENING";
};

export function DashboardHeader({ institution, isLoading }: DashboardHeaderProps) {
    const { t } = useTranslation();
    const greetingSuffix = getGreetingSuffix();

    return (
        <div className="relative bg-card border-b border-border px-4 sm:px-6 lg:px-8 py-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-10 w-96" />
                            <Skeleton className="h-5 w-64 mt-2" />
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl md:text-4xl font-extrabold font-spline tracking-tight bg-linear-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                                {t(`INSTITUTION_DASHBOARD.WELCOME.GREETING_${greetingSuffix}`)},{" "}
                                <span className="text-foreground">{institution?.institutionName || "Institution"}</span>
                            </h1>
                            <p className="text-muted-foreground font-spline text-lg">
                                {t("INSTITUTION_DASHBOARD.WELCOME.SUBTITLE")}
                            </p>
                        </>
                    )}
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="gap-2 h-11 border-primary/20 hover:border-primary/50 hover:bg-primary/5 hidden sm:flex" asChild>
                        <Link to="/institution/missions">
                            <Users className="h-4 w-4 text-primary" />
                            <span>{t("INSTITUTION_DASHBOARD.ACTIONS.INVITE_WORKFORCE")}</span>
                        </Link>
                    </Button>
                    <Button className="gap-2 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                        <Link to="/institution/missions/create">
                            <PlusCircle className="h-4 w-4" />
                            <span>{t("INSTITUTION_DASHBOARD.ACTIONS.CREATE_MISSION")}</span>
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
