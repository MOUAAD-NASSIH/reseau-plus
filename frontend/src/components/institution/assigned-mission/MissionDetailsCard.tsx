import { Briefcase, Calendar, ExternalLink, Globe2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useTranslation } from "react-i18next";
import type { MissionAssignment } from "@/types/assignment.types";

interface MissionDetailsCardProps {
    assignment: MissionAssignment;
}

export function MissionDetailsCard({ assignment }: MissionDetailsCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-background border border-border/60 shadow-xs text-primary">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold font-spline">{t("CREATE_MISSION.SECTIONS.DETAILS")}</CardTitle>
                            <CardDescription>{t("ASSIGNMENT_DETAILS.OVERVIEW.DESC")}</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div>
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">{t("CREATE_MISSION.DETAILS.DESCRIPTION_LABEL")}</p>
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {assignment.mission?.description || "No detailed description available."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/40">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{t("ASSIGNMENT_DETAILS.SIDEBAR.START_DATE")}</p>
                            <p className="font-semibold text-sm">{assignment.mission?.startDate ? formatDate(assignment.mission.startDate) : "-"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 text-purple-500 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{t("ASSIGNMENT_DETAILS.SIDEBAR.END_DATE")}</p>
                            <p className="font-semibold text-sm">{assignment.mission?.endDate ? formatDate(assignment.mission.endDate) : "-"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <Globe2 className="h-5 w-5 text-orange-500 mt-0.5" />
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{t("MISSION_APPLICANTS.TABLE.LOCATION")}</p>
                            <p className="font-semibold text-sm">{assignment.mission?.location || "Remote"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="h-5 w-5 flex items-center justify-center font-bold text-emerald-600">$</div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase">{t("CREATE_MISSION.LOGISTICS.BUDGET_LABEL")}</p>
                            <p className="font-semibold text-sm font-spline">{assignment.mission?.budget ? formatCurrency(assignment.mission.budget) : "---"}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
