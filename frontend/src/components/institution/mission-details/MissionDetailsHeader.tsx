
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
        <div className="flex items-center justify-between border-b pb-6 border-border/50">
            <div className="flex items-center gap-4">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-muted/50"
                    onClick={() => navigate(-1)}
                >
                    <ArrowLeft className="h-6 w-6 text-foreground" />
                </Button>
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">
                        {title}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <Link to="/institution" className="hover:text-primary transition-colors">{t("NAV.DASHBOARD")}</Link>
                        <span>/</span>
                        <Link to="/institution/missions" className="hover:text-primary transition-colors">{t("NAV.MISSIONS")}</Link>
                        <span>/</span>
                        <span className="text-foreground font-semibold">{t("COMMON.DETAILS")}</span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    className="h-10 rounded-xl font-bold px-4 border-border/60 hover:bg-muted transition-all" 
                    onClick={onShare}
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    {t("MISSION_DETAILS.SHARE")}
                </Button>
                <Button 
                    className="h-10 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold px-4 shadow-lg shadow-primary/20 transition-all hover:scale-[1.02]" 
                    asChild
                >
                    <Link to={`/institution/missions/${missionId}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        {t("MISSION_DETAILS.EDIT_MISSION")}
                    </Link>
                </Button>
            </div>
        </div>
    );
}
