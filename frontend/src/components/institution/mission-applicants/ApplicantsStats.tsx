import { Users, TrendingUp, Clock, Check, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface ApplicantsStatsProps {
    stats: {
        total: number;
        pending: number;
        accepted: number;
    };
}

export function ApplicantsStats({ stats }: ApplicantsStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="w-24 h-24 text-chart-2 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_APPLICANTS.STATS.TOTAL")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-2/10 text-chart-2 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{t("MISSION_APPLICANTS.STATS.ALL_APPLICATIONS")}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Clock className="w-24 h-24 text-chart-4 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_APPLICANTS.STATS.PENDING")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-4/10 text-chart-4 rounded-lg flex items-center justify-center">
                        <Clock className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
                    <div className="flex items-center text-xs text-chart-4 mt-1 font-medium">
                        <Clock className="h-3 w-3 mr-1" />
                        <span>{t("MISSION_APPLICANTS.STATS.NEEDS_ACTION")}</span>
                    </div>
                </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Award className="w-24 h-24 text-primary transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_APPLICANTS.STATS.ACCEPTED")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Check className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{stats.accepted}</div>
                    <div className="flex items-center text-xs text-primary mt-1 font-medium">
                        <Award className="h-3 w-3 mr-1" />
                        <span>{t("MISSION_APPLICANTS.STATS.ASSIGNED_WORKERS")}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
