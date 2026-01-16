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
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder={t("INSTITUTION_ASSIGNMENTS.FILTER.SEARCH_PLACEHOLDER") || "Search assignments..."}
                    className="pl-10 bg-card/50 border-border/50 rounded-xl"
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground w-max whitespace-nowrap">
                    <Filter className="h-4 w-4" />
                    <span>{t("INSTITUTION_ASSIGNMENTS.FILTER.STATUS")}</span>
                </div>
                <Select value={statusFilter} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[180px] bg-card/50 border-border/50 rounded-xl shadow-sm">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/40 shadow-xl">
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
}
