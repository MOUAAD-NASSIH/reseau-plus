
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Calendar,
    MapPin,
    ClipboardList,
    ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Separator } from "@/components/ui/separator";
import type { MissionAssignment } from "@/types/assignment.types";

interface PaymentMissionSummaryProps {
    assignment: MissionAssignment;
}

export function PaymentMissionSummary({
    assignment,
}: PaymentMissionSummaryProps) {
    const { t } = useTranslation();

    if (!assignment) return null;

    const mission = assignment.mission;
    const worker = assignment.worker;

    return (
        <Card className="border-border/50 shadow-sm bg-card overflow-hidden rounded-xl transition-all">
            <CardHeader className="bg-muted/10 p-6 border-b">
                <div className="flex items-center gap-2 mb-3">
                    <ClipboardList className="h-4 w-4 text-primary" />
                    <CardTitle className="font-spline text-sm font-bold uppercase tracking-wider text-muted-foreground">
                        {t("PAYMENT.MISSION_REVIEW")}
                    </CardTitle>
                </div>
                <h2 className="font-spline text-xl font-bold text-foreground leading-tight hover:text-primary transition-colors">
                    {mission?.title}
                </h2>
                <div className="flex items-center gap-2 mt-4">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none rounded-lg px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-wider">
                        {mission?.requiredSpeciality?.name || t("COMMON.MISSION")}
                    </Badge>
                    <Badge variant="outline" className="rounded-lg border-muted-foreground/20 text-muted-foreground font-medium text-[10px]">
                        REF: {assignment.id}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
                {/* Worker Section */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {t("PAYMENT.MISSION.WORKER")}
                    </h3>
                    <div className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border border-border/40 group hover:border-primary/30 transition-all">
                        <Avatar className="h-12 w-12 rounded-lg ring-2 ring-background shadow-sm">
                            <AvatarImage src={assignment.worker?.profilePicture || assignment.worker?.user?.profilePicture || undefined} className="object-cover" />
                            <AvatarFallback className="bg-primary/5 text-primary text-lg font-bold">
                                {worker?.firstName?.[0]}
                                {worker?.lastName?.[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-base leading-none">
                                    {worker?.firstName} {worker?.lastName}
                                </p>
                                <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-wide">
                                {worker?.speciality?.name || t("COMMON.WORKER")}
                            </p>
                        </div>
                    </div>
                </div>

                <Separator className="opacity-40" />

                {/* Logistics Section */}
                <div className="grid grid-cols-1 gap-5">
                    <div className="flex items-start gap-3">
                        <Calendar className="h-4 w-4 text-primary/70 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                {t("PAYMENT.MISSION.DATES")}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                {mission?.startDate ? new Date(mission.startDate).toLocaleDateString() : 'N/A'} - {mission?.endDate ? new Date(mission.endDate).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-primary/70 mt-0.5" />
                        <div className="space-y-0.5">
                            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">
                                {t("COMMON.LOCATION")}
                            </p>
                            <p className="text-sm font-semibold text-foreground">
                                {mission?.location || t("COMMON.REMOTE")}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <div className="p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <p className="text-xs text-primary/80 font-medium leading-relaxed italic">
                            {t("PAYMENT.MISSION.NOTE") || "Your payment ensures fair compensation for dedicated service."}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
