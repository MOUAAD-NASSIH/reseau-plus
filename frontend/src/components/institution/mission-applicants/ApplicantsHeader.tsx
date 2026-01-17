import { Link } from "react-router";
import { ArrowLeft, Calendar, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import type { Mission } from "@/types/mission.types";

interface ApplicantsHeaderProps {
    mission: Mission;
}

export function ApplicantsHeader({ mission }: ApplicantsHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" asChild aria-label={t("MISSION_APPLICANTS.BACK_TO_MISSIONS")} className="shrink-0 mt-1">
                    <Link to="/institution/missions">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{mission.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">ID: #{mission.id}</span>
                        <span>•</span>
                        <StatusBadge status={mission.status} />
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(mission.createdAt), "MMM d, yyyy")}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" asChild className="border-border hover:bg-muted font-medium">
                    <Link to={`/institution/missions/${mission.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("MISSION_DETAILS.EDIT_MISSION")}
                    </Link>
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] font-semibold">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("MISSION_APPLICANTS.ACTIONS.INVITE")}
                </Button>
            </div>
        </div>
    );
}
