
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
    MoreVertical,
    Eye,
    CreditCard,
    Star,
    CheckCircle2,
    ClipboardList
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { cn } from "@/lib/utils";
import type { MissionAssignment } from "@/types/assignment.types";

interface AssignmentsTableProps {
    data: MissionAssignment[];
    isLoading: boolean;
    reviewedAssignmentIds: Set<number>;
    paidAssignmentIds: Set<number>;
    onViewAssignment: (assignment: MissionAssignment) => void;
    onPayment: (assignmentId: number) => void;
    onReview: (assignmentId: number) => void;
}

const StatusDot = ({ status }: { status: string }) => {
    const { t } = useTranslation();
    const config: Record<string, { color: string, label: string }> = {
        ACTIVE: { color: "bg-blue-500", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ACTIVE") },
        ONGOING: { color: "bg-blue-500", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ONGOING") },
        COMPLETED: { color: "bg-emerald-500", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.COMPLETED") },
        CANCELLED: { color: "bg-rose-500", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.CANCELLED") },
        PENDING: { color: "bg-amber-500", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.PENDING") },
    };

    const s = config[status] || { color: "bg-slate-500", label: status };

    return (
        <div className={cn(
            "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold gap-1.5 transition-colors",
            status === 'ACTIVE' || status === 'ONGOING' ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" :
                status === 'COMPLETED' ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400" :
                    status === 'CANCELLED' ? "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400" :
                        "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
        )}>
            <span className={cn("h-1.5 w-1.5 rounded-full animate-pulse", s.color)} />
            {s.label}
        </div>
    );
};

export function AssignmentsTable({
    data,
    isLoading,
    reviewedAssignmentIds,
    paidAssignmentIds,
    onViewAssignment,
    onPayment,
    onReview
}: AssignmentsTableProps) {
    const { t } = useTranslation();

    const columns: ColumnDef<MissionAssignment>[] = useMemo(
        () => [
            {
                accessorKey: "worker",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.WORKER")} className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2" />
                ),
                cell: ({ row }) => {
                    const worker = row.original.worker;
                    return (
                        <div className="flex items-center gap-3 pl-2">
                            <div className="relative group/avatar cursor-pointer">
                                <Avatar className="h-10 w-10 border-2 border-background shadow-sm group-hover/avatar:scale-105 transition-transform duration-300">
                                    <AvatarImage src={worker?.profilePicture || worker?.user?.profilePicture || undefined} alt={`${worker?.firstName} ${worker?.lastName}`} className="object-cover" />
                                    <AvatarFallback className="bg-primary/10 text-primary font-black text-xs">
                                        {worker?.firstName?.[0] || ""}{worker?.lastName?.[0] || ""}
                                    </AvatarFallback>
                                </Avatar>
                                {worker?.status === "VERIFIED" && (
                                    <div className="absolute -bottom-0.5 -right-0.5 bg-background p-0.5 rounded-full">
                                        <CheckCircle2 className="h-3 w-3 text-blue-500 fill-blue-500/20" />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                                    {worker?.firstName} {worker?.lastName}
                                </span>
                                <span className="text-[11px] text-muted-foreground font-medium">
                                    {worker?.speciality?.name || t("COMMON.SOCIAL_WORKER")}
                                </span>
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => `${row.worker?.firstName || ""} ${row.worker?.lastName || ""}`,
            },
            {
                accessorKey: "mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.MISSION")} className="text-xs font-bold uppercase tracking-wider text-muted-foreground" />
                ),
                cell: ({ row }) => {
                    const mission = row.original.mission;
                    return (
                        <div className="flex flex-col gap-1 max-w-[300px]">
                            <span className="font-bold text-sm text-foreground" title={mission?.title}>
                                {mission?.title || t("COMMON.N_A")}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary/40" />
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-tight truncate">
                                    {mission?.requiredSpeciality?.name || t("COMMON.SOCIAL_SERVICE")}
                                </span>
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.STATUS")} className="text-xs font-bold uppercase tracking-wider text-muted-foreground" />
                ),
                cell: ({ row }) => <StatusDot status={row.getValue("status")} />,
            },
            {
                accessorKey: "mission.budget",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.PAYMENT")} className="text-xs font-bold uppercase tracking-wider text-muted-foreground" />
                ),
                cell: ({ row }) => {
                    const assignment = row.original;
                    const budget = assignment.mission?.budget;
                    const isCompleted = assignment.status === "COMPLETED";
                    const hasPaid = paidAssignmentIds.has(assignment.id);

                    let paymentStatus = "PENDING";
                    let paymentColor = "text-amber-600 bg-amber-500/10 border-amber-500/20";

                    if (hasPaid) {
                        paymentStatus = "PAID";
                        paymentColor = "text-emerald-600 bg-emerald-500/10 border-emerald-500/20";
                    } else if (isCompleted) {
                        paymentStatus = "PENDING";
                        paymentColor = "text-amber-600 bg-amber-500/10 border-amber-500/20";
                    } else {
                        paymentStatus = "LOCKED";
                        paymentColor = "text-muted-foreground bg-muted border-border/50";
                    }

                    return (
                        <div className="flex flex-col items-start gap-1">
                            <span className="text-sm font-black font-mono text-foreground">
                                {budget ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "MAD",
                                    maximumFractionDigits: 0
                                }).format(budget) : "-"}
                            </span>
                            <div className={cn("px-1.5 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-wide", paymentColor)}>
                                {t(`INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.${paymentStatus}`)}
                            </div>
                        </div>
                    );
                },
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => {
                    const assignment = row.original;
                    const isCompleted = assignment.status === "COMPLETED";
                    const hasReviewed = reviewedAssignmentIds.has(assignment.id);
                    const hasPaid = paidAssignmentIds.has(assignment.id);
                    const canPay = isCompleted && !hasPaid;
                    const canReview = isCompleted && !hasReviewed;

                    return (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-muted data-[state=open]:bg-muted transition-colors">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl shadow-xl border-border/50 p-2">
                                <DropdownMenuLabel className="text-xs font-bold text-muted-foreground px-2 py-1.5 uppercase tracking-wider">
                                    {t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.ACTIONS")}
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onViewAssignment(assignment)} className="rounded-lg gap-2 cursor-pointer py-2 focus:bg-primary/5 focus:text-primary">
                                    <Eye className="h-4 w-4" />
                                    <span className="font-medium">{t("MY_MISSIONS.CARD.VIEW_DETAILS")}</span>
                                </DropdownMenuItem>
                                {canPay && (
                                    <DropdownMenuItem onClick={() => onPayment(assignment.id)} className="rounded-lg gap-2 cursor-pointer py-2 text-emerald-600 focus:bg-emerald-500/10 focus:text-emerald-700">
                                        <CreditCard className="h-4 w-4" />
                                        <span className="font-medium">{t("INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.PAID")}</span>
                                    </DropdownMenuItem>
                                )}
                                {canReview && (
                                    <DropdownMenuItem onClick={() => onReview(assignment.id)} className="rounded-lg gap-2 cursor-pointer py-2 text-amber-600 focus:bg-amber-500/10 focus:text-amber-700">
                                        <Star className="h-4 w-4" />
                                        <span className="font-medium">{t("COMMON.REVIEW") || "Review"}</span>
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    );
                },
            },
        ],
        [t, onViewAssignment, onPayment, onReview, reviewedAssignmentIds, paidAssignmentIds]
    );

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    enableSorting={true}
                    enablePagination={true}
                    pageSize={10}
                    emptyIcon={ClipboardList}
                    emptyTitle={t("INSTITUTION_ASSIGNMENTS.TABLE.EMPTY_STATE.TITLE")}
                    emptyDescription={t("INSTITUTION_ASSIGNMENTS.TABLE.EMPTY_STATE.DESCRIPTION")}
                    className="border-none w-full"
                />
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4 p-4 bg-muted/20">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="bg-card w-full h-40 rounded-xl animate-pulse" />
                    ))
                ) : data.length > 0 ? (
                    data.map((assignment) => (
                        <MobileAssignmentCard
                            key={assignment.id}
                            assignment={assignment}
                            onView={() => onViewAssignment(assignment)}
                            onPayment={() => onPayment(assignment.id)}
                            onReview={() => onReview(assignment.id)}
                            hasPaid={paidAssignmentIds.has(assignment.id)}
                            hasReviewed={reviewedAssignmentIds.has(assignment.id)}
                        />
                    ))
                ) : (
                    <div className="text-center py-10 text-muted-foreground">
                        <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p>{t("INSTITUTION_ASSIGNMENTS.TABLE.EMPTY_STATE.TITLE")}</p>
                    </div>
                )}
            </div>
        </>
    );
}

function MobileAssignmentCard({
    assignment,
    onView,
    onPayment,
    onReview,
    hasPaid,
    hasReviewed
}: {
    assignment: MissionAssignment;
    onView: () => void;
    onPayment: () => void;
    onReview: () => void;
    hasPaid: boolean;
    hasReviewed: boolean;
}) {
    const { t } = useTranslation();
    const isCompleted = assignment.status === "COMPLETED";
    const canPay = isCompleted && !hasPaid;
    const canReview = isCompleted && !hasReviewed;

    return (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-background shadow-xs">
                        <AvatarImage src={assignment.worker?.profilePicture || assignment.worker?.user?.profilePicture || undefined} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {assignment.worker?.firstName?.[0]}{assignment.worker?.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-sm text-foreground">
                            {assignment.worker?.firstName} {assignment.worker?.lastName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            {assignment.mission?.requiredSpeciality?.name || t("COMMON.SOCIAL_WORKER")}
                        </p>
                    </div>
                </div>
                <StatusDot status={assignment.status} />
            </div>

            <div className="space-y-2">
                <p className="font-bold text-sm leading-tight text-foreground/90">
                    {assignment.mission?.title}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-mono font-medium text-foreground">
                        {assignment.mission?.budget ? `${assignment.mission.budget} MAD` : "-"}
                    </span>
                    <span>•</span>
                    <span className={cn(
                        "font-bold text-[10px] uppercase",
                        hasPaid ? "text-emerald-600" : isCompleted ? "text-amber-600" : "text-muted-foreground"
                    )}>
                        {hasPaid
                            ? t("INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.PAID")
                            : isCompleted
                                ? t("INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.PENDING")
                                : t("INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.LOCKED")
                        }
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                <Button variant="outline" size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg" onClick={onView}>
                    <Eye className="h-3.5 w-3.5 mr-2" />
                    {t("COMMON.DETAILS") || "Details"}
                </Button>
                {canPay && (
                    <Button size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white" onClick={onPayment}>
                        <CreditCard className="h-3.5 w-3.5 mr-2" />
                        {t("COMMON.PAID") || "Pay"}
                    </Button>
                )}
                {canReview && (
                    <Button size="sm" className="flex-1 h-8 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white" onClick={onReview}>
                        <Star className="h-3.5 w-3.5 mr-2" />
                        {t("COMMON.REVIEW") || "Review"}
                    </Button>
                )}
            </div>
        </div>
    );
}
