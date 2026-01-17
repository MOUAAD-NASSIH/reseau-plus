import { Link } from "react-router";
import { ArrowLeft, BadgeCheck, Clock, CreditCard, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

export function AssignmentHeader({ assignment, isPaid, canPay, onPayment }: AssignmentHeaderProps) {
    const { t } = useTranslation();

    return (
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-slate-950 p-8 md:p-12 text-slate-950 dark:text-white border border-border dark:border-white/5 shadow-2xl shadow-slate-200 dark:shadow-primary/10 transition-all duration-500 hover:shadow-primary/20 group">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-96 w-96 bg-primary/5 dark:bg-primary/20 rounded-full blur-[100px] group-hover:bg-primary/10 dark:group-hover:bg-primary/30 transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 h-64 w-64 bg-chart-2/5 dark:bg-chart-2/10 rounded-full blur-[80px]" />
            
            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <Button variant="secondary" size="icon" asChild className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-white/10 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/20 transition-all text-slate-900 dark:text-white">
                            <Link to="/institution/missions">
                                <ArrowLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <Badge variant="outline" className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-white/90 text-xs font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                            {t("ASSIGNED_MISSION_VIEW.HEADER.ASSIGNMENT_ID", { id: assignment.id })}
                        </Badge>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight text-slate-950 dark:text-white">
                        {assignment.mission?.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-white/70">
                        <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-slate-200 dark:border-white/5">
                            <StatusBadge status={assignment.status} />
                        </div>
                        {isPaid && (
                            <Badge variant="success" className="bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/10 dark:border-emerald-500/20 px-4 py-1.5 rounded-xl font-bold flex items-center gap-2">
                                <BadgeCheck className="h-4 w-4" />
                                {t("COMMON.PAID")}
                            </Badge>
                        )}
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Clock className="h-4 w-4" />
                            {t("ASSIGNED_MISSION_VIEW.HEADER.CREATED_ON", { date: formatDate(assignment.assignedAt) })}
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {canPay ? (
                        <Button 
                            onClick={onPayment} 
                            size="lg" 
                            className="bg-primary text-primary-foreground hover:bg-primary/90 font-black rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 px-8"
                        >
                            <CreditCard className="h-5 w-5" />
                            {t("ASSIGNED_MISSION_VIEW.HEADER.PROCESS_PAYMENT")}
                        </Button>
                    ) : isPaid && (
                            <Button 
                            variant="outline"
                            size="lg" 
                            className="bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/20 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-white/10 font-black rounded-2xl transition-all flex items-center gap-2 px-8"
                        >
                            <Download className="h-5 w-5" />
                            {t("ASSIGNED_MISSION_VIEW.HEADER.EXPORT")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
