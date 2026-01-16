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

export function DashboardHeader({ institution, isLoading }: DashboardHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight">
                    {isLoading ? (
                        <Skeleton className="h-9 w-64" />
                    ) : (
                        t("INSTITUTION_DASHBOARD.WELCOME", { name: institution?.institutionName || "Institution" })
                    )}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("INSTITUTION_DASHBOARD.SUBTITLE")}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button variant="outline" className="hidden sm:flex" asChild>
                    <Link to="/institution/missions">
                        <Users className="mr-2 h-4 w-4" />
                        {t("INSTITUTION_DASHBOARD.ACTIONS.INVITE_WORKFORCE")}
                    </Link>
                </Button>
                <Button asChild className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]">
                    <Link to="/institution/missions/create">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        {t("INSTITUTION_DASHBOARD.ACTIONS.CREATE_MISSION")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
