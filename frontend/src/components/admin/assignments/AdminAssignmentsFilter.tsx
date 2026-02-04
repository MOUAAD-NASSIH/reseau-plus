import { useTranslation } from "react-i18next";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { AssignmentStatus } from "@/types/assignment.types";

interface AdminAssignmentsFilterProps {
    statusFilter: AssignmentStatus | "ALL";
    onStatusChange: (status: AssignmentStatus | "ALL") => void;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
}

export function AdminAssignmentsFilter({
    statusFilter,
    onStatusChange,
    searchQuery,
    onSearchChange
}: AdminAssignmentsFilterProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6 p-4 rounded-2xl bg-card/40 backdrop-blur-md border border-border/40 shadow-sm">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                <Input
                    placeholder={t("INSTITUTION_ASSIGNMENTS.FILTER.SEARCH_PLACEHOLDER") || "Search assignments..."}
                    className="pl-9 bg-background/50 border-border/50 rounded-xl hover:bg-background/80 transition-colors h-10"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm font-medium text-muted-foreground hidden sm:inline-block">
                    {t("INSTITUTION_ASSIGNMENTS.FILTER.STATUS")}
                </span>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/50 border-border/50 rounded-xl h-10">
                        <div className="flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground/70" />
                            <SelectValue placeholder="Select status" />
                        </div>
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 shadow-xl">
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
