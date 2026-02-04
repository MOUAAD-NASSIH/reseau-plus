
import { Link, useNavigate } from "react-router";
import { ArrowLeft, Share2, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MissionDetailsHeaderProps {
    title: string;
    missionId: number;
    onShare: () => void;
    t: (key: string) => string;
}

export function MissionDetailsHeader({ title, missionId, onShare, t }: MissionDetailsHeaderProps) {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 border-b pb-6 border-border/50">
            {/* Left Section - Title and Breadcrumbs */}
            <div className="flex items-start gap-3 sm:gap-4 min-w-0 flex-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-muted/70 shrink-0 transition-all hover:scale-110 active:scale-95"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-5 w-5 text-foreground" />
                </Button>
                <div className="space-y-2 min-w-0 flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-spline">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground font-medium flex-wrap">
                        <Link to="/institution" className="hover:text-primary transition-colors hover:underline">
                            {t("MISSION_DETAILS.BREADCRUMBS.DASHBOARD")}
                        </Link>
                        <span className="text-border">/</span>
                        <Link to="/institution/missions" className="hover:text-primary transition-colors hover:underline">
                            {t("MISSION_DETAILS.BREADCRUMBS.MISSIONS")}
                        </Link>
                        <span className="text-border">/</span>
                        <span className="text-foreground font-semibold">
                            {t("MISSION_DETAILS.BREADCRUMBS.MISSION_DETAILS")}#{missionId}
                        </span>
                    </div>
                </div>
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center justify-end gap-3 shrink-0">
                <Button
                    variant="outline"
                    className="h-10 sm:h-11 rounded-xl font-semibold px-4 sm:px-5 border-border/60 hover:bg-muted/70 hover:border-border transition-all hover:scale-[1.02] active:scale-95"
                    onClick={onShare}
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">{t("MISSION_DETAILS.SHARE")}</span>
                </Button>
                <Button
                    className="h-10 sm:h-11 rounded-xl bg-linear-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground font-semibold px-4 sm:px-5 shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/35 hover:scale-[1.02] active:scale-95"
                    asChild
                >
                    <Link to={`/institution/missions/${missionId}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">{t("MISSION_DETAILS.EDIT_MISSION")}</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
