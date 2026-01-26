import { Link } from "react-router";
import { Clock, CreditCard, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDate } from "@/lib/formatters";
import { useTranslation } from "react-i18next";
import type { MissionAssignment } from "@/types/assignment.types";

interface AssignmentHeaderProps {
    assignment: MissionAssignment;
    isPaid: boolean;
    canPay: boolean;
    onPayment: () => void;
}

export function AssignmentHeader({ assignment, canPay, onPayment }: Omit<AssignmentHeaderProps, "isPaid">) {
    const { t } = useTranslation();

    return (
        <div className="space-y-3 p-2">
            {/* Breadcrumbs */}
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <Link to="/institution" className="hover:text-primary transition-colors flex items-center gap-1">
                    {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.DASHBOARD")}
                </Link>
                <ChevronRight className="h-4 w-4 text-border" />
                <Link to="/institution/missions" className="hover:text-primary transition-colors flex items-center gap-1">
                    {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.ASSIGNMENTS")}
                </Link>
                <ChevronRight className="h-4 w-4 text-border" />
                <span className="text-foreground font-medium truncate">
                    {t("ASSIGNED_MISSION_VIEW.HEADER.BREADCRUMBS.ASSIGNMENT_ID", { id: assignment.id })}
                </span>
            </div>

            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                <div className="flex-1 space-y-4">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={assignment.status} className="px-2.5 py-1 text-xs font-semibold" />
                    </div>

                    {/* Title */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black font-spline tracking-tight text-foreground leading-tight">
                            {assignment.mission?.title}
                        </h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                            <Clock className="h-4 w-4" />
                            <span>{t("ASSIGNED_MISSION_VIEW.HEADER.CREATED_ON", { date: formatDate(assignment.assignedAt) })}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3 lg:min-w-[200px]">
                    {canPay && (
                        <Button
                            onClick={onPayment}
                            size="lg"
                            className="w-full rounded-full shadow-lg shadow-primary/20 font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <CreditCard className="h-4 w-4 mr-2" />
                            {t("ASSIGNED_MISSION_VIEW.HEADER.PROCESS_PAYMENT")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
