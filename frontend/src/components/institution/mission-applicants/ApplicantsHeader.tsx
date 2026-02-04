import { Link } from "react-router";
import { Calendar, Edit } from "lucide-react";
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
                <div className="min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-spline">{mission.title}</h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mt-2">
                        <StatusBadge status={mission.status} />
                        <span>•</span>
                        <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(mission.createdAt), "MMM d, yyyy")}
                        </span>
                    </div>
                </div>
            </div>
            <div>
                <Button className="w-fullgap-2 h-11 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25" asChild>
                    <Link to={`/institution/missions/${mission.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span>{t("MISSION_DETAILS.EDIT_MISSION")}</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
