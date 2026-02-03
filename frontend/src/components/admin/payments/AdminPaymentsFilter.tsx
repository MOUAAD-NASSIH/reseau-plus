import { useTranslation } from "react-i18next";
import { Filter, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { PaymentStatus } from "@/types/payment.types";

interface AdminPaymentsFilterProps {
    statusFilter: PaymentStatus | "ALL";
    onStatusChange: (status: PaymentStatus | "ALL") => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onExport: () => void;
    totalRecords: number;
}

export function AdminPaymentsFilter({
    statusFilter,
    onStatusChange,
    searchQuery,
    onSearchChange,
    onExport,
    totalRecords
}: AdminPaymentsFilterProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col lg:flex-row gap-4 p-4 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 shadow-sm">
            {/* Search Input */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input
                    placeholder={t("ADMIN_PAYMENTS.FILTER.SEARCH_PLACEHOLDER")}
                    className="pl-9 bg-background/50 border-border/50 rounded-xl hover:bg-background/80 transition-colors h-10"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>

            {/* Filters and Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                        {t("ADMIN_PAYMENTS.FILTER.STATUS")}
                    </span>
                    <Select value={statusFilter} onValueChange={onStatusChange}>
                        <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50 rounded-xl h-10">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground/70" />
                                <SelectValue placeholder="Select status" />
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/40 shadow-xl">
                            <SelectItem value="ALL">{t("ADMIN_PAYMENTS.FILTER.ALL_STATUS")}</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Export Button */}
                <Button
                    variant="outline"
                    className="h-10 px-4 font-semibold text-xs uppercase tracking-wider border-border/40 hover:bg-primary hover:text-white transition-all rounded-xl shadow-sm"
                    onClick={onExport}
                    disabled={totalRecords === 0}
                >
                    <Download className="h-4 w-4 mr-2" />
                    {t("ADMIN_PAYMENTS.FILTER.EXPORT")}
                </Button>
            </div>
        </div>
    );
}
