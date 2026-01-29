import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import { Search, Banknote, Download, FileDown, Calendar } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import type { PaymentStatus } from "@/types/payment.types";

interface PaymentsTableProps {
    data: any[];
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: PaymentStatus | "ALL";
    onStatusFilterChange: (status: PaymentStatus | "ALL") => void;
    isLoading: boolean;
    formatCurrency: (amount: number) => string;
    onExport: () => void;
}

export function PaymentsTable({
    data,
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    isLoading,
    formatCurrency,
    onExport
}: PaymentsTableProps) {
    const { t } = useTranslation();

    const columns: ColumnDef<any>[] = useMemo(
        () => [
            {
                accessorKey: "assignment.worker",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title={t("FINANCIAL.TABLE.COLUMNS.WORKER")}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-2"
                    />
                ),
                cell: ({ row }) => {
                    const w = row.original.missionAssignment?.worker;
                    return w ? (
                        <div className="flex items-center gap-3 pl-2">
                            <Avatar className="h-8 w-8 border border-background shadow-sm">
                                <AvatarImage
                                    src={w.profilePicture || w.user?.profilePicture}
                                    alt={`${w.firstName} ${w.lastName}`}
                                    className="object-cover"
                                />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                    {w.firstName[0]}
                                    {w.lastName[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-bold text-foreground truncate">
                                    {w.firstName} {w.lastName}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-medium truncate">
                                    {w.speciality?.name || t("COMMON.SOCIAL_WORKER")}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <span className="text-muted-foreground pl-2">-</span>
                    );
                },
            },
            {
                accessorKey: "assignment.mission.title",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title={t("FINANCIAL.TABLE.COLUMNS.MISSION")}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    />
                ),
                cell: ({ row }) => {
                    const a = row.original.missionAssignment;
                    return (
                        <div className="flex flex-col gap-1 max-w-[200px]">
                            <span className="font-bold text-sm text-foreground truncate" title={a?.mission?.title}>
                                {a?.mission?.title || `#${row.original.missionAssignmentId}`}
                            </span>
                        </div>
                    );
                },
            },
            {
                accessorKey: "amountTotal",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title={t("FINANCIAL.TABLE.COLUMNS.AMOUNT")}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    />
                ),
                cell: ({ row }) => (
                    <span className="text-xs font-black font-spline text-foreground">
                        {formatCurrency(row.original.amountTotal)}
                    </span>
                ),
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title={t("FINANCIAL.TABLE.COLUMNS.STATUS")}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    />
                ),
                cell: ({ row }) => {
                    const status = row.getValue("status") as string;
                    return <StatusBadge status={status as any} className="text-[10px] font-bold px-2 py-0.5" />;
                },
            },
            {
                accessorKey: "paidAt",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title={t("FINANCIAL.TABLE.COLUMNS.DATE")}
                        className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
                    />
                ),
                cell: ({ row }) => {
                    const d = row.original.paidAt || row.original.createdAt;
                    return (
                        <span className="text-xs text-muted-foreground font-medium whitespace-nowrap">
                            {d ? format(new Date(d), "MMM d, yyyy") : "-"}
                        </span>
                    );
                },
            },
            {
                id: "actions",
                header: () => (
                    <div className="flex justify-center text-xs uppercase tracking-wider font-bold text-muted-foreground">
                        {t("FINANCIAL.TABLE.COLUMNS.RECEIPT")}
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex justify-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary transition-colors rounded-full"
                            onClick={() => exportReceiptToPDF(row.original)}
                            title="Download Receipt"
                        >
                            <FileDown className="h-4 w-4" />
                        </Button>
                    </div>
                ),
            },
        ],
        [t, formatCurrency]
    );

    return (
        <>
            {/* Desktop Table */}
            <div className="hidden md:block">
                <Card className="border border-border/40 shadow-xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 border-b border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <Banknote className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-foreground">{t("FINANCIAL.TABLE.TITLE").split('...')[0]}</h3>
                                <p className="text-xs text-muted-foreground font-medium">{t("FINANCIAL.KPI.INVOICES_COUNT", { count: data.length })}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                            {/* SEARCH */}
                            <div className="relative w-full lg:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t("FINANCIAL.TABLE.SEARCH_PLACEHOLDER")}
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-9 h-10 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20 transition-all focus:bg-background"
                                />
                            </div>

                            {/* STATUS FILTER */}
                            <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as any)}>
                                <SelectTrigger className="w-full lg:min-w-[140px] lg:w-auto h-10 bg-background/50 border-border/40 rounded-xl">
                                    <SelectValue placeholder={t("FINANCIAL.TABLE.FILTER.STATUS")} />
                                </SelectTrigger>
                                <SelectContent className="font-spline text-sm font-medium rounded-xl border-border/40">
                                    <SelectItem value="ALL">{t("FINANCIAL.TABLE.FILTER.ALL")}</SelectItem>
                                    <SelectItem value="PENDING">{t("COMMON.PENDING")}</SelectItem>
                                    <SelectItem value="COMPLETED">{t("COMMON.COMPLETED")}</SelectItem>
                                    <SelectItem value="FAILED">{t("COMMON.FAILED")}</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* EXPORT */}
                            <Button
                                variant="outline"
                                className="h-10 px-4 font-bold text-xs uppercase tracking-widest border-border/40 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm w-full lg:w-auto"
                                onClick={onExport}
                                disabled={!data.length}
                            >
                                <Download className="h-4 w-4 mr-2" />
                                {t("FINANCIAL.EXPORT")}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        <DataTable
                            columns={columns}
                            data={data}
                            isLoading={isLoading}
                            enableSorting
                            enablePagination
                            pageSize={8}
                            emptyIcon={Banknote}
                            emptyTitle={t("FINANCIAL.TABLE.EMPTY.TITLE")}
                            emptyDescription={t("FINANCIAL.TABLE.EMPTY.DESCRIPTION")}
                            className="border-none"
                        />
                    </CardContent>
                </Card>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
                <Card className="border border-border/40 shadow-xl bg-card/60 backdrop-blur-xl rounded-3xl overflow-hidden">
                    <CardHeader className="p-4 border-b border-border/40 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
                                <Banknote className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold tracking-tight text-foreground">{t("FINANCIAL.TABLE.TITLE").split('...')[0]}</h3>
                                <p className="text-xs text-muted-foreground font-medium">{t("FINANCIAL.KPI.INVOICES_COUNT", { count: data.length })}</p>
                            </div>
                        </div>

                        {/* Mobile Filters */}
                        <div className="space-y-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t("FINANCIAL.TABLE.SEARCH_PLACEHOLDER")}
                                    value={searchQuery}
                                    onChange={(e) => onSearchChange(e.target.value)}
                                    className="pl-9 h-10 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20 transition-all focus:bg-background"
                                />
                            </div>

                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={(v) => onStatusFilterChange(v as any)}>
                                    <SelectTrigger className="flex-1 h-10 bg-background/50 border-border/40 rounded-xl">
                                        <SelectValue placeholder={t("FINANCIAL.TABLE.FILTER.STATUS")} />
                                    </SelectTrigger>
                                    <SelectContent className="font-spline text-sm font-medium rounded-xl border-border/40">
                                        <SelectItem value="ALL">{t("FINANCIAL.TABLE.FILTER.ALL")}</SelectItem>
                                        <SelectItem value="PENDING">{t("COMMON.PENDING")}</SelectItem>
                                        <SelectItem value="COMPLETED">{t("COMMON.COMPLETED")}</SelectItem>
                                        <SelectItem value="FAILED">{t("COMMON.FAILED")}</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-10 w-10 border-border/40 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm shrink-0"
                                    onClick={onExport}
                                    disabled={!data.length}
                                    title={t("FINANCIAL.EXPORT")}
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </CardHeader>

                    <div className="p-4 space-y-4 bg-muted/10">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="bg-card w-full h-40 rounded-xl animate-pulse border border-border/50" />
                            ))
                        ) : data.length > 0 ? (
                            data.map((payment) => (
                                <MobilePaymentCard
                                    key={payment.id}
                                    payment={payment}
                                    formatCurrency={formatCurrency}
                                    t={t}
                                />
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Banknote className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                <p className="font-medium">{t("FINANCIAL.TABLE.EMPTY.TITLE")}</p>
                                <p className="text-xs mt-1">{t("FINANCIAL.TABLE.EMPTY.DESCRIPTION")}</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </>
    );
}

function MobilePaymentCard({
    payment,
    formatCurrency,
    t
}: {
    payment: any;
    formatCurrency: (v: number) => string;
    t: any;
}) {
    const w = payment.missionAssignment?.worker;
    const status = payment.status;
    const date = payment.paidAt || payment.createdAt;

    return (
        <div className="bg-card rounded-xl border border-border/50 shadow-sm p-4 space-y-4">
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-background shadow-xs">
                        <AvatarImage
                            src={w?.profilePicture || w?.user?.profilePicture}
                            className="object-cover"
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {w?.firstName?.[0]}{w?.lastName?.[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h4 className="font-bold text-sm text-foreground">
                            {w?.firstName} {w?.lastName}
                        </h4>
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                            {w?.speciality?.name || t("COMMON.SOCIAL_WORKER")}
                        </p>
                    </div>
                </div>
                <StatusBadge status={status} className="text-[10px] font-bold px-2 py-0.5" />
            </div>

            <div className="space-y-2">
                <p className="font-bold text-sm leading-tight text-foreground/90 line-clamp-2">
                    {payment.missionAssignment?.mission?.title || `#${payment.missionAssignmentId}`}
                </p>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {date ? format(new Date(date), "MMM d, yyyy") : "-"}
                    </div>
                    <span className="text-xs font-black font-spline text-foreground">
                        {formatCurrency(payment.amountTotal)}
                    </span>
                </div>
            </div>

            <div className="pt-2 border-t border-border/40">
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-8 text-xs font-bold rounded-lg"
                    onClick={() => exportReceiptToPDF(payment)}
                >
                    <FileDown className="h-3.5 w-3.5 mr-2" />
                    {t("FINANCIAL.TABLE.COLUMNS.RECEIPT")}
                </Button>
            </div>
        </div>
    );
}
