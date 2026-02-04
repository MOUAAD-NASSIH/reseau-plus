import { useTranslation } from "react-i18next";

export function AdminMissionsHeader() {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold tracking-tight text-foreground lg:text-4xl font-spline">
                    {t("ADMIN_MISSIONS.TITLE", "Missions Overview")}
                </h1>
                <p className="text-muted-foreground text-lg">
                    {t("ADMIN_MISSIONS.SUBTITLE", "Monitor and manage all mission activities across the platform.")}
                </p>
            </div>
        </div>
    );
}
