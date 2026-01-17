
import { format } from "date-fns";
import { Wallet, Calendar, Users, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MissionKPIsProps {
    budget: number;
    startDate: string;
    endDate: string;
    activeApplicants: number;
    totalApplications: number;
    t: (key: string, options?: any) => string;
}

export function MissionKPIs({ 
    budget, 
    startDate, 
    endDate, 
    activeApplicants, 
    totalApplications, 
    t 
}: MissionKPIsProps) {
    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Budget Card */}
            <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Wallet className="w-24 h-24 text-primary transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_DETAILS.TOTAL_BUDGET")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Wallet className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                        {budget?.toLocaleString() || "0"} <span className="text-sm font-medium opacity-70">{t("COMMON.CURRENCY")}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Timeline Card */}
            <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Calendar className="w-24 h-24 text-chart-4 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_DETAILS.MISSION_TIMELINE")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-4/10 text-chart-4 rounded-lg flex items-center justify-center">
                        <Calendar className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground truncate">
                        {format(new Date(startDate), "MMM d")} - {format(new Date(endDate), "MMM d")}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                        {t("MISSION_DETAILS.MISSION_TIMELINE_DAYS", { count: Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) })}
                    </div>
                </CardContent>
            </Card>

            {/* Applicants Card */}
            <Card className="relative overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card group">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <Users className="w-24 h-24 text-chart-2 transform rotate-12" />
                </div>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_DETAILS.APPLICANTS")}
                    </CardTitle>
                    <div className="h-9 w-9 bg-chart-2/10 text-chart-2 rounded-lg flex items-center justify-center">
                        <Users className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-foreground">
                        {activeApplicants} {t("MISSION_DETAILS.ACTIVE")}
                    </div>
                    <div className="flex items-center text-xs text-chart-5 mt-1 font-medium">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        <span>{t("MISSION_DETAILS.TOTAL_ACROSS_STATUSES", { count: totalApplications })}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
