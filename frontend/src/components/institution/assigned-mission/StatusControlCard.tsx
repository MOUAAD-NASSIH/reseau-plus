import { Settings, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { AssignmentStatus, MissionAssignment } from "@/types/assignment.types";

interface StatusControlCardProps {
    assignment: MissionAssignment;
    isUpdating: boolean;
    onStatusChange: (status: AssignmentStatus) => void;
}

export function StatusControlCard({ assignment, isUpdating, onStatusChange }: StatusControlCardProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-border/40 shadow-xl rounded-[2rem] overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-2 border-primary/20">
            <CardHeader className="p-8">
                <CardTitle className="text-xl font-bold flex items-center gap-3">
                    <Settings className="h-5 w-5 text-primary" />
                    {t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.STATUS")}
                </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-3">
                    <label className="text-xs font-bold text-muted-foreground">{t("INSTITUTION_ASSIGNMENTS.FILTER.STATUS")}</label>
                    <Select
                        value={assignment.status}
                        onValueChange={(value) => onStatusChange(value as AssignmentStatus)}
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="h-14 rounded-2xl border-2 border-primary/10 focus:border-primary transition-all text-lg font-bold">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-2">
                            <SelectItem value="ACTIVE" className="rounded-xl my-1">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ACTIVE")}</SelectItem>
                            <SelectItem value="ONGOING" className="rounded-xl my-1">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ONGOING")}</SelectItem>
                            <SelectItem value="COMPLETED" className="rounded-xl my-1">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.COMPLETED")}</SelectItem>
                            <SelectItem value="CANCELLED" className="rounded-xl my-1">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.CANCELLED")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-start gap-3 p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <AlertCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-primary/80 leading-relaxed font-medium">
                        {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.COMPLETE_FOR_PAYMENT")}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
