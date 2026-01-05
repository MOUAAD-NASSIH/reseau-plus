import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { CreditCard, Eye, Calendar, User, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { usePayments } from "@/features/hooks/usePayments";
import { useInstitutionAssignments } from "@/features/hooks/useAssignments";
import type { Payment, PaymentStatus } from "@/types/payment.types";

export default function PaymentHistory() {
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");

    const { data: paymentsData, isLoading: paymentsLoading } = usePayments(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined
    );
    const { data: assignmentsData, isLoading: assignmentsLoading } = useInstitutionAssignments();

    const payments = paymentsData?.data || [];
    const assignments = assignmentsData?.data || [];

    // Get assignments that need payment (completed but not paid)
    const pendingPaymentAssignments = useMemo(() => {
        return assignments.filter((a) => {
            const hasPayment = payments.some(
                (p) => p.missionAssignmentId === a.id && p.status === "COMPLETED"
            );
            return a.status === "COMPLETED" && !hasPayment;
        });
    }, [assignments, payments]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(amount);
    };

    // Calculate totals
    const totals = useMemo(() => ({
        totalPaid: payments
            .filter((p) => p.status === "COMPLETED")
            .reduce((sum, p) => sum + p.amountTotal, 0),
        totalPending: payments
            .filter((p) => p.status === "PENDING")
            .reduce((sum, p) => sum + p.amountTotal, 0),
    }), [payments]);

    // Enrich payments with assignment data
    const enrichedPayments = useMemo(() => {
        return payments.map((payment) => {
            const assignment = assignments.find((a) => a.id === payment.missionAssignmentId);
            return {
                ...payment,
                assignment,
            };
        });
    }, [payments, assignments]);

    // Column definitions for DataTable
    const columns: ColumnDef<Payment & { assignment?: typeof assignments[0] }>[] = useMemo(
        () => [
            {
                accessorKey: "paidAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Date" />
                ),
                cell: ({ row }) => {
                    const payment = row.original;
                    const dateStr = payment.paidAt || payment.createdAt;
                    return (
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>
                                {dateStr ? format(new Date(dateStr), "MMM d, yyyy") : "-"}
                            </span>
                        </div>
                    );
                },
                accessorFn: (row) => row.paidAt || row.createdAt || "",
            },
            {
                accessorKey: "assignment.mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Mission" />
                ),
                cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <p className="font-medium truncate max-w-[200px]">
                            {payment.assignment?.mission?.title || `#${payment.missionAssignmentId}`}
                        </p>
                    );
                },
                accessorFn: (row) => row.assignment?.mission?.title || "",
            },
            {
                accessorKey: "assignment.worker.firstName",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Worker" />
                ),
                cell: ({ row }) => {
                    const worker = row.original.assignment?.worker;
                    return worker ? (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>{worker.firstName} {worker.lastName}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
                accessorFn: (row) => {
                    const worker = row.assignment?.worker;
                    return worker ? `${worker.firstName} ${worker.lastName}` : "";
                },
            },
            {
                accessorKey: "amountTotal",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Amount" />
                ),
                cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <div>
                            <p className="font-semibold">{formatCurrency(payment.amountTotal)}</p>
                            <p className="text-xs text-muted-foreground">
                                Worker: {formatCurrency(payment.workerAmount)}
                            </p>
                        </div>
                    );
                },
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
                filterFn: (row, id, value) => value.includes(row.getValue(id)),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const payment = row.original;
                    return (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="icon"
                                asChild
                                title="View assignment"
                            >
                                <Link to={`/institution/assignments/${payment.missionAssignmentId}`}>
                                    <Eye className="h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        []
    );

    const isLoading = paymentsLoading || assignmentsLoading;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold text-success">
                                {formatCurrency(totals.totalPaid)}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-24" />
                        ) : (
                            <div className="text-2xl font-bold text-warning">
                                {formatCurrency(totals.totalPending)}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Awaiting Payment</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {pendingPaymentAssignments.length}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Completed missions awaiting payment
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Assignments Awaiting Payment */}
            {pendingPaymentAssignments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Missions Awaiting Payment</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {pendingPaymentAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {assignment.mission?.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignment.worker?.firstName}{" "}
                                                {assignment.worker?.lastName}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {assignment.mission?.budget && (
                                            <span className="font-semibold">
                                                {formatCurrency(assignment.mission.budget)}
                                            </span>
                                        )}
                                        <Button size="sm" asChild>
                                            <Link to={`/institution/payments/${assignment.id}`}>
                                                Pay Now
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Payment History Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Payment History
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {payments.length}
                            </Badge>
                        )}
                    </CardTitle>
                    <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as PaymentStatus | "ALL")}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={enrichedPayments}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search payments..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={CreditCard}
                        emptyTitle="No payments found"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No payments match the selected filter."
                                : "You haven't made any payments yet."
                        }
                        emptyAction={
                            statusFilter !== "ALL" ? (
                                <Button variant="outline" onClick={() => setStatusFilter("ALL")}>
                                    Clear Filter
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>
        </div>
    );
}
