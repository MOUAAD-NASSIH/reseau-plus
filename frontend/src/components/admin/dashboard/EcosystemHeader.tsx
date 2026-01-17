import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

export function EcosystemHeader() {
    const { t } = useTranslation();

    const handleExport = () => {
        console.log("Exporting admin report...");
        // TODO: Implement export functionality
    };

    return (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
                <h1 className="text-4xl font-extrabold tracking-tight text-foreground lg:text-5xl font-spline">
                    {t("ADMIN_DASHBOARD.TITLE")}
                </h1>
                <p className="text-muted-foreground text-lg max-w-[600px]">
                    {t("ADMIN_DASHBOARD.SUBTITLE")}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    onClick={handleExport}
                    className="bg-background hover:bg-accent transition-colors"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {t("ADMIN_DASHBOARD.ACTIONS.EXPORT_REPORT")}
                </Button>
            </div>
        </div>
    );
}
