import { Briefcase, Calendar, MapPin, ExternalLink } from "lucide-react";
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
        <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
            <CardHeader className="p-8 border-b border-border/40 bg-muted/20">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-bold flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>
                            {t("CREATE_MISSION.SECTIONS.DETAILS")}
                        </CardTitle>
                        <CardDescription>Comprehensive overview of mission requirements</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/5">
                        <ExternalLink className="h-5 w-5 text-muted-foreground" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
                <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t("CREATE_MISSION.DETAILS.TITLE_LABEL")}</label>
                        <p className="text-lg font-bold text-foreground">{assignment.mission?.title}</p>
                    </div>
                    <div className="space-y-1 text-right">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">{t("CREATE_MISSION.LOGISTICS.BUDGET_LABEL")}</label>
                        <p className="text-2xl font-black text-primary">
                            {assignment.mission?.budget ? formatCurrency(assignment.mission.budget) : "---"}
                        </p>
                    </div>
                </div>

                <div className="p-6 rounded-3xl bg-muted/30 border border-border/50">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-3">{t("CREATE_MISSION.DETAILS.DESCRIPTION_LABEL")}</label>
                    <p className="text-muted-foreground leading-relaxed">
                        {assignment.mission?.description || "No detailed description available for this mission."}
                    </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-6">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border shadow-sm">
                        <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground/70">Start Date</p>
                            <p className="text-sm font-bold">{assignment.mission?.startDate ? formatDate(assignment.mission.startDate) : "-"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border shadow-sm">
                        <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground/70">End Date</p>
                            <p className="text-sm font-bold">{assignment.mission?.endDate ? formatDate(assignment.mission.endDate) : "-"}</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-card border shadow-sm">
                        <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                            <MapPin className="h-5 w-5" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-muted-foreground/70">Location</p>
                            <p className="text-sm font-bold truncate">{assignment.mission?.location || "Remote"}</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
