import { User, MapPin, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerRating } from "@/components/common/WorkerRating";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "react-i18next";
import type { MissionAssignment } from "@/types/assignment.types";

interface WorkerProfileCardProps {
    assignment: MissionAssignment;
}

export function WorkerProfileCard({ assignment }: WorkerProfileCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-card/50 backdrop-blur-sm group hover:border-primary/20 transition-all duration-300">
            <CardHeader className="p-8 border-b border-border/40 bg-muted/20 flex flex-row items-center justify-between">
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                        <User className="h-6 w-6 text-chart-4" />
                    </div>
                    {t("ASSIGNED_MISSION_VIEW.WORKER_PROFILE.TITLE")}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="relative group/avatar">
                        <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-xl scale-90 group-hover/avatar:scale-110 transition-transform duration-500" />
                        <div className="relative h-32 w-32 rounded-[2.5rem] bg-muted border-4 border-background flex items-center justify-center shadow-2xl overflow-hidden">
                            {assignment.worker?.firstName ? (
                                    <div className="text-4xl font-black text-primary">
                                        {assignment.worker.firstName[0]}
                                    </div>
                            ) : (
                                <User className="h-12 w-12 text-muted-foreground" />
                            )}
                        </div>
                    </div>

                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-foreground">
                                {assignment.worker?.firstName} {assignment.worker?.lastName}
                            </h3>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-none px-4 py-1 font-bold">
                                    {assignment.worker?.speciality?.name || "Professional"}
                                </Badge>
                                {assignment.worker?.id && <WorkerRating workerId={assignment.worker.id} />}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-4 border-t border-border/40">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">{t("MISSION_APPLICANTS.TABLE.LOCATION")}</p>
                                <p className="text-sm font-bold flex items-center justify-center md:justify-start gap-1">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    {assignment.worker?.city || "Not specified"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">{t("MISSION_APPLICANTS.TABLE.EXPERIENCE")}</p>
                                <p className="text-sm font-bold">
                                    {assignment.worker?.experienceYears ? t("MISSION_APPLICANTS.TABLE.YEARS", { count: assignment.worker.experienceYears }) : "-"}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase text-muted-foreground/70 tracking-widest">{t("ASSIGNED_MISSION_VIEW.WORKER_PROFILE.ASSIGNED_ON")}</p>
                                <p className="text-sm font-bold flex items-center justify-center md:justify-start gap-1">
                                    <Clock className="h-3.5 w-3.5 text-primary" />
                                    {formatDate(assignment.assignedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

