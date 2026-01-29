import { Settings, AlertCircle, BadgeCheck } from "lucide-react";
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
        <Card className="border-border shadow-xs overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border/60 shadow-xs text-primary">
                        <Settings className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-lg font-bold font-spline">
                        {t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.STATUS")}
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {t("INSTITUTION_ASSIGNMENTS.FILTER.STATUS")}
                    </label>
                    <Select
                        value={assignment.status}
                        onValueChange={(value) => onStatusChange(value as AssignmentStatus)}
                        disabled={isUpdating}
                    >
                        <SelectTrigger className="h-10 w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ACTIVE">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ACTIVE")}</SelectItem>
                            <SelectItem value="ONGOING">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ONGOING")}</SelectItem>
                            <SelectItem value="COMPLETED">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.COMPLETED")}</SelectItem>
                            <SelectItem value="CANCELLED">{t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.CANCELLED")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {assignment.status !== 'COMPLETED' && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 text-sm">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.COMPLETE_FOR_PAYMENT")}
                        </p>
                    </div>
                )}

                {assignment.status === 'COMPLETED' && (
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-sm border border-emerald-100 dark:border-emerald-900/30">
                        <BadgeCheck className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            {t("ASSIGNED_MISSION_VIEW.PAYMENT_STATUS.READY_FOR_PAYMENT") || "Mission completed. You can now proceed to payment."}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
