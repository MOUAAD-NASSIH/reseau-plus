import { useNavigate } from "react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function MissionsHeader() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{t("MY_MISSIONS.TITLE")}</h1>
                <p className="text-muted-foreground text-lg">
                    {t("MY_MISSIONS.SUBTITLE")}
                </p>
            </div>
            <Button onClick={() => navigate("/institution/missions/create")} className="shrink-0 h-10 px-6 font-semibold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="mr-2 h-5 w-5" />
                {t("MY_MISSIONS.CREATE_NEW")}
            </Button>
        </div>
    );
}
