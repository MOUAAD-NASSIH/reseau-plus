import { Briefcase, Users, Activity, CreditCard, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslation } from "react-i18next";

interface DashboardStatsProps {
    activeMissionsCount: number;
    openMissionsCount: number;
    assignedMissionsCount: number;
    totalPaymentAmount: number;
    assignmentsCount: number;
    isLoading: boolean;
}

export function DashboardStats({
    activeMissionsCount,
    openMissionsCount,
    assignedMissionsCount,
    totalPaymentAmount,
    assignmentsCount,
    isLoading
}: DashboardStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Active Missions Card */}
            <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Briefcase className="w-24 h-24 text-primary transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("INSTITUTION_DASHBOARD.STATS.ACTIVE_MISSIONS")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Briefcase className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? <Skeleton className="h-8 w-12" /> : activeMissionsCount}</div>
                    <div className="flex items-center text-sm text-chart-5 mt-1 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{openMissionsCount} {t("INSTITUTION_DASHBOARD.ACTIONS.RECRUITING")}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Open Missions (Recruiting) Card */}
            <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Users className="w-24 h-24 text-chart-4 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("INSTITUTION_DASHBOARD.STATS.OPEN_MISSIONS")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-4/10 text-chart-4 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? <Skeleton className="h-8 w-12" /> : openMissionsCount}</div>
                     <div className="flex items-center text-sm text-muted-foreground mt-1 font-medium">
                        <span>{t("INSTITUTION_DASHBOARD.ACTIONS.AWAITING_APPLICANTS")}</span>
                    </div>
                </CardContent>
            </Card>

             {/* Assigned/Ongoing Missions Card */}
             <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Activity className="w-24 h-24 text-chart-2 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("INSTITUTION_DASHBOARD.STATS.ASSIGNED_MISSIONS")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-2/10 text-chart-2 rounded-lg flex items-center justify-center">
                        <Activity className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">{isLoading ? <Skeleton className="h-8 w-12" /> : assignedMissionsCount}</div>
                     <div className="text-xs text-muted-foreground mt-1">
                        {assignmentsCount} {t("INSTITUTION_DASHBOARD.ACTIONS.TOTAL_ASSIGNMENTS")}
                    </div>
                </CardContent>
            </Card>

             {/* Payments Card */}
             <Card className="relative overflow-hidden border-none shadow-md bg-card group transition-all hover:shadow-lg">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <CreditCard className="w-24 h-24 text-chart-5 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                     <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("INSTITUTION_DASHBOARD.STATS.TOTAL_PAYMENTS")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-5/10 text-chart-5 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                        {isLoading ? <Skeleton className="h-8 w-20" /> : `${(totalPaymentAmount).toLocaleString()}`} 
                        <span className="text-sm font-normal text-muted-foreground ml-1">MAD</span>
                    </div>
                     <div className="text-xs text-muted-foreground mt-1">
                         {t("INSTITUTION_DASHBOARD.ACTIONS.LIFETIME_TOTAL")}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
