
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format, differenceInDays } from "date-fns";
import {
    MoreVertical,
    Eye,
    CreditCard,
    Star,
    CheckCircle2,
    ClipboardList
} from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { WorkerRating } from "@/components/common/WorkerRating";
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
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.WORKER")} />
                ),
                cell: ({ row }) => {
                    const worker = row.original.worker;
                    return (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9 border border-border/50">
                                <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                    {worker?.firstName?.[0] || ""}{worker?.lastName?.[0] || ""}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">
                                    {worker?.firstName} {worker?.lastName}
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate italic">
                                    {worker?.user?.email}
                                </span>
                                {worker?.id && <WorkerRating workerId={worker.id} showLabel={false} className="mt-1" />}
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => `${row.worker?.firstName || ""} ${row.worker?.lastName || ""} ${row.worker?.user?.email || ""}`,
            },
            {
                accessorKey: "mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.MISSION")} />
                ),
                cell: ({ row }) => {
                    const mission = row.original.mission;
                    return (
                        <div className="flex flex-col">
                            <span className="font-bold text-foreground truncate max-w-[200px]">
                                {mission?.title || t("COMMON.N_A")}
                            </span>
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter opacity-80">
                                {mission?.domains && mission.domains[0]?.domain?.name ? mission.domains[0].domain.name : t("COMMON.SOCIAL_SERVICE")}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.STATUS")} />
                ),
                cell: ({ row }) => <StatusDot status={row.getValue("status")} />,
            },
            {
                accessorKey: "dates",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.DATES")} />
                ),
                cell: ({ row }) => {
                    const start = new Date(row.original.mission?.startDate || "");
                    const end = new Date(row.original.mission?.endDate || "");
                    const days = differenceInDays(end, start) || 1;
                    return (
                        <div className="flex flex-col text-sm">
                            <span className="font-medium text-foreground/80">
                                {format(start, "MMM dd")} - {format(end, "MMM dd, yyyy")}
                            </span>
                            <span className="text-[11px] text-muted-foreground font-medium">
                                {t("INSTITUTION_ASSIGNMENTS.TABLE.DAYS", { count: days })}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "mission.budget",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title={t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.PAYMENT")} />
                ),
                cell: ({ row }) => {
                    const assignment = row.original;
                    const budget = assignment.mission?.budget;
                    const isCompleted = assignment.status === "COMPLETED";
                    const hasPaid = paidAssignmentIds.has(assignment.id);

                    let paymentStatus = "PENDING";
                    let paymentColor = "text-amber-500";

                    if (hasPaid) {
                        paymentStatus = "PAID";
                        paymentColor = "text-emerald-500";
                    } else if (isCompleted) {
                        paymentStatus = "PENDING";
                        paymentColor = "text-amber-500";
                    }

                    return (
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">
                                {budget ? new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: "MAD",
                                }).format(budget) : "-"}
                            </span>
                            <span className={cn("text-[10px] font-bold uppercase tracking-wider", paymentColor)}>
                                {t(`INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.${paymentStatus}`)}
                            </span>
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
                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted/50 rounded-full">
                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-border/50">
                                <DropdownMenuLabel className="text-xs text-muted-foreground px-3 py-2">
                                    {t("INSTITUTION_ASSIGNMENTS.TABLE.COLUMNS.ACTIONS")}
                                </DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => onViewAssignment(assignment)} className="rounded-lg gap-2 cursor-pointer">
                                    <Eye className="h-4 w-4" /> {t("MY_MISSIONS.CARD.VIEW_DETAILS")}
                                </DropdownMenuItem>
                                {canPay && (
                                    <DropdownMenuItem onClick={() => onPayment(assignment.id)} className="rounded-lg gap-2 cursor-pointer text-primary">
                                        <CreditCard className="h-4 w-4" /> {t("INSTITUTION_ASSIGNMENTS.TABLE.PAYMENT_STATUS.PAID")}
                                    </DropdownMenuItem>
                                )}
                                {canReview && (
                                    <DropdownMenuItem onClick={() => onReview(assignment.id)} className="rounded-lg gap-2 cursor-pointer">
                                        <Star className="h-4 w-4" /> {t("MY_MISSIONS.CARD.APPLICANTS")}
                                    </DropdownMenuItem>
                                )}
                                {hasReviewed && (
                                    <DropdownMenuItem disabled className="text-muted-foreground opacity-50 gap-2">
                                        <CheckCircle2 className="h-4 w-4" /> {t("MISSION_APPLICANTS.MESSAGES.ACCEPT_SUCCESS")}
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
        <Card className="border-border/50 shadow-md rounded-3xl overflow-hidden bg-card/30 backdrop-blur-sm">
            <CardContent className="p-0">
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
                    className="border-none"
                />
            </CardContent>
        </Card>
    );
}
