
import { useMemo } from "react";
import { format } from "date-fns";
import { Search, Banknote, Download, FileDown, Building2 } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import { exportReceiptToPDF } from "@/lib/exportUtils";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Payment, PaymentStatus } from "@/types/payment.types";

interface AdminPaymentsTableProps {
    data: Payment[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: PaymentStatus | "ALL";
    onStatusFilterChange: (status: PaymentStatus | "ALL") => void;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
    onExport: () => void;
}

export function AdminPaymentsTable({
    data,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    isLoading,
    formatCurrency,
    onExport
}: AdminPaymentsTableProps) {
    const columns: ColumnDef<Payment>[] = useMemo(
        () => [
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Status"
                    />
                ),
                cell: ({ row }) => {
                    const status = row.getValue("status") as string;
                    const stripeId = (row.original as any).stripePaymentId;
                    const displayStatus = (status === "PENDING" && stripeId) ? "COMPLETED" : status;
                    return <StatusBadge status={displayStatus as any} className="text-xs font-medium" />;
                },
            },
            {
                accessorKey: "institution",
                header: ({ column }) => (
                   <DataTableColumnHeader
                        column={column}
                        title="Institution"
                    />
                ),
                cell: ({ row }) => {
                    
                    // Assuming institution details are nested in missionAssignment -> mission -> institution
                    // Or we might need to rely on what's available. 
                    // Based on typical Prisma inclusions, if not eager loaded, this might be empty.
                    // However, for admin view, let's assume valid data or fallbacks.
                    const instName = row.original.institution?.institutionName;
                    console.log(row.original);
                    return (
                        <div className="flex items-center gap-2">
                             <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <Building2 className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-sm max-w-[150px] truncate">
                                {instName || "Institution"}
                            </span>
                        </div>
                    );
                }
            },
            {
                accessorKey: "assignment.mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Mission"
                    />
                ),
                cell: ({ row }) => {
                    const a = row.original.missionAssignment;
                    return (
                        <div className="flex flex-col">
                            <span className="font-medium max-w-[180px] truncate text-sm">
                                {a?.mission?.title || `#${row.original.missionAssignmentId}`}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                Mission #{a?.mission?.id}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "assignment.worker",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Worker"
                    />
                ),
                cell: ({ row }) => {
                    const w = row.original.missionAssignment?.worker;
                    return w ? (
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {w.firstName?.[0]}
                                    {w.lastName?.[0]}
                                </AvatarFallback>
                            </Avatar>
                            <span className="font-medium truncate text-sm">
                                {w.firstName} {w.lastName}
                            </span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                accessorKey: "paidAt",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Date"
                    />
                ),
                cell: ({ row }) => {
                    const d = row.original.paidAt || row.original.createdAt;
                    return (
                        <span className="text-xs text-muted-foreground font-medium">
                            {d ? format(new Date(d), "MMM d, yyyy") : "-"}
                        </span>
                    );
                },
            },
            {
                accessorKey: "amountTotal",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Total Amount"
                    />
                ),
                cell: ({ row }) => (
                    <span className="font-bold text-foreground">
                        {formatCurrency(row.original.amountTotal)}
                    </span>
                ),
            },
             {
                accessorKey: "platformFee",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Fee"
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-xs font-medium text-muted-foreground">
                        {formatCurrency(row.original.platformFee)}
                    </span>
                ),
            },
            {
                id: "actions",
                header: () => (
                    <div className="flex justify-center text-xs uppercase">
                        Receipt
                    </div>
                ),
                cell: ({ row }) => (
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => exportReceiptToPDF(row.original)}
                        title="Download Receipt"
                    >
                        <FileDown className="h-4 w-4" />
                    </Button>
                ),
            },
        ],
        [formatCurrency]
    );

    return (
        <Card className="border border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-b border-border/40">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Banknote className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold tracking-tight">System Payments</h3>
                        <p className="text-xs text-muted-foreground font-medium">{data.length} total records found</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                    {/* SEARCH */}
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search payments..."
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9 h-11 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20"
                        />
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        {/* STATUS FILTER */}
                        <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as any)}>
                            <SelectTrigger className="min-w-[130px] h-11 bg-background/50 border-border/40 rounded-xl">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="font-spline text-sm font-medium rounded-xl border-border/40">
                                <SelectItem value="ALL">All Status</SelectItem>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                <SelectItem value="FAILED">Failed</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* EXPORT */}
                        <Button
                            variant="outline"
                            className="h-11 px-4 font-bold text-xs uppercase tracking-widest border-border/40 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm"
                            onClick={onExport}
                            disabled={!data.length}
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export
                        </Button>
                    </div>
                </div>
            </CardHeader>

            {/* TABLE RENDER */}
            <CardContent className="p-0">
                <DataTable
                    columns={columns}
                    data={data}
                    isLoading={isLoading}
                    enableSorting
                    enablePagination
                    pageSize={8}
                    emptyIcon={Banknote}
                    emptyTitle="No payments found"
                    emptyDescription="Try adjusting your filters or search terms."
                    className="border-none"
                />
            </CardContent>
        </Card>
    );
}
