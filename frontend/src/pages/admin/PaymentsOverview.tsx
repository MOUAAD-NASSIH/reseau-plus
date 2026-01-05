import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    CreditCard,
    Filter,
    Calendar,
    User,
    Building2,
    DollarSign,
    Eye,
    X,
    TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { usePayments } from "@/features/hooks/usePayments";
import type { Payment, PaymentStatus } from "@/types/payment.types";

interface PaymentDetailsDialogProps {
    payment: Payment | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function PaymentDetailsDialog({ payment, open, onOpenChange }: PaymentDetailsDialogProps) {
    if (!payment) return null;

    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return "Not paid yet";
        return new Date(dateString).toLocaleDateString("fr-MA", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(amount);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Details
                    </DialogTitle>
                    <DialogDescription>
                        Payment #{payment.id} information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <StatusBadge status={payment.status} />
                    </div>

                    {/* Amount Breakdown */}
                    <div className="space-y-3">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Amount Breakdown
                        </Label>
                        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Total Amount</span>
                                <span className="font-medium">{formatCurrency(payment.amountTotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Platform Fee</span>
                                <span className="text-destructive">-{formatCurrency(payment.platformFee)}</span>
                            </div>
                            <div className="border-t pt-2 flex justify-between">
                                <span className="font-medium">Worker Amount</span>
                                <span className="font-bold text-success">{formatCurrency(payment.workerAmount)}</span>
                            </div>
                        </div>
                    </div>

                    {/* IDs */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Building2 className="h-3 w-3" />
                                Institution ID
                            </Label>
                            <p className="font-medium">{payment.institutionId}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Worker ID
                            </Label>
                            <p className="font-medium">{payment.workerId}</p>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Created At
                            </Label>
                            <p className="font-medium">{formatDate(payment.createdAt)}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Paid At
                            </Label>
                            <p className="font-medium">{formatDate(payment.paidAt)}</p>
                        </div>
                    </div>

                    {/* Stripe Info */}
                    {payment.stripePaymentId && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Stripe Payment ID</Label>
                            <p className="font-mono text-sm bg-muted/50 p-2 rounded">
                                {payment.stripePaymentId}
                            </p>
                        </div>
                    )}

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground border-t pt-4">
                        <p>Payment ID: {payment.id}</p>
                        <p>Assignment ID: {payment.missionAssignmentId}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function PaymentsOverview() {
    const [statusFilter, setStatusFilter] = useState<PaymentStatus | "ALL">("ALL");
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch data
    const { data: paymentsData, isLoading: paymentsLoading } = usePayments(
        statusFilter !== "ALL" ? { status: statusFilter } : undefined
    );

    const payments = paymentsData?.data || [];

    // Calculate totals
    const totals = useMemo(() => {
        const completed = payments.filter(p => p.status === "COMPLETED");
        return {
            totalRevenue: completed.reduce((sum, p) => sum + p.amountTotal, 0),
            totalFees: completed.reduce((sum, p) => sum + p.platformFee, 0),
            totalWorkerPayouts: completed.reduce((sum, p) => sum + p.workerAmount, 0),
        };
    }, [payments]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(amount);
    };

    const handleViewPayment = useCallback((payment: Payment) => {
        setSelectedPayment(payment);
        setDialogOpen(true);
    }, []);

    // Column definitions for DataTable
    const columns: ColumnDef<Payment>[] = useMemo(
        () => [
            {
                accessorKey: "id",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="ID" />
                ),
                cell: ({ row }) => (
                    <span className="font-mono text-sm">#{row.getValue("id")}</span>
                ),
            },
            {
                accessorKey: "amountTotal",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Amount" />
                ),
                cell: ({ row }) => (
                    <span className="font-medium">
                        {formatCurrency(row.getValue("amountTotal"))}
                    </span>
                ),
            },
            {
                accessorKey: "platformFee",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Platform Fee" />
                ),
                cell: ({ row }) => (
                    <span className="text-muted-foreground">
                        {formatCurrency(row.getValue("platformFee"))}
                    </span>
                ),
            },
            {
                accessorKey: "workerAmount",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Worker Amount" />
                ),
                cell: ({ row }) => (
                    <span className="text-success font-medium">
                        {formatCurrency(row.getValue("workerAmount"))}
                    </span>
                ),
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
                accessorKey: "paidAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Paid At" />
                ),
                cell: ({ row }) => {
                    const paidAt = row.getValue("paidAt") as string | null;
                    return (
                        <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {paidAt ? format(new Date(paidAt), "MMM d, yyyy") : "-"}
                        </div>
                    );
                },
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
                                size="sm"
                                onClick={() => handleViewPayment(payment)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleViewPayment]
    );

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Revenue
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-success" />
                            <span className="text-2xl font-bold">
                                {formatCurrency(totals.totalRevenue)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Platform Fees
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-info" />
                            <span className="text-2xl font-bold">
                                {formatCurrency(totals.totalFees)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Worker Payouts
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-purple-600" />
                            <span className="text-2xl font-bold">
                                {formatCurrency(totals.totalWorkerPayouts)}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Status Filter */}
                        <div className="space-y-2 w-full md:w-64">
                            <label className="text-sm font-medium">Status</label>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value as PaymentStatus | "ALL")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="COMPLETED">Completed</SelectItem>
                                    <SelectItem value="FAILED">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {statusFilter !== "ALL" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setStatusFilter("ALL")}
                                className="text-muted-foreground mt-6"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear filter
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Payments Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        All Payments
                        {!paymentsLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {payments.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={payments}
                        isLoading={paymentsLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search by ID or Stripe ID..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={CreditCard}
                        emptyTitle="No payments found"
                        emptyDescription={
                            statusFilter !== "ALL"
                                ? "No payments match the current filters. Try adjusting your search criteria."
                                : "There are no payments in the system yet."
                        }
                        emptyAction={
                            statusFilter !== "ALL" ? (
                                <Button variant="outline" onClick={() => setStatusFilter("ALL")}>
                                    Clear filter
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>

            {/* Payment Details Dialog */}
            <PaymentDetailsDialog
                payment={selectedPayment}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
