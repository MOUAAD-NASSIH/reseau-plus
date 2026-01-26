import { User, MapPin, Clock, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkerRating } from "@/components/common/WorkerRating";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "react-i18next";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { MissionAssignment } from "@/types/assignment.types";

interface WorkerProfileCardProps {
    assignment: MissionAssignment;
}

export function WorkerProfileCard({ assignment }: WorkerProfileCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border/60 shadow-xs text-primary">
                        <User className="h-5 w-5" />
                    </div>
                    <div>
                        <CardTitle className="text-lg font-bold font-spline">{t("ASSIGNED_MISSION_VIEW.WORKER_PROFILE.TITLE")}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6">
                <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 border rounded-full">
                        <AvatarImage src={assignment.worker?.profilePicture || assignment.worker?.user?.profilePicture || undefined} className="object-cover" />
                        <AvatarFallback className="bg-muted text-lg font-bold">
                            {assignment.worker?.firstName?.[0] || '?'}{assignment.worker?.lastName?.[0] || '?'}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 space-y-1">
                        <h3 className="text-xl font-bold text-foreground font-spline">
                            {assignment.worker?.firstName} {assignment.worker?.lastName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {assignment.worker?.speciality?.name || "Professional"}
                            </Badge>
                            {assignment.worker?.id && <WorkerRating workerId={assignment.worker.id} />}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border/40">
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{t("MISSION_APPLICANTS.TABLE.LOCATION")}</p>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                            {assignment.worker?.city || "Not specified"}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs font-medium text-muted-foreground">{t("MISSION_APPLICANTS.TABLE.EXPERIENCE")}</p>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-muted-foreground" />
                            {assignment.worker?.experienceYears ? t("MISSION_APPLICANTS.TABLE.YEARS", { count: assignment.worker.experienceYears }) : "-"}
                        </p>
                    </div>
                    <div className="space-y-1 col-span-2 sm:col-span-1">
                        <p className="text-xs font-medium text-muted-foreground">{t("ASSIGNED_MISSION_VIEW.WORKER_PROFILE.ASSIGNED_ON")}</p>
                        <p className="text-sm font-semibold flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            {formatDate(assignment.assignedAt)}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

