import { useTranslation } from "react-i18next";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AssignmentsFilterProps {
    statusFilter: string;
    onStatusChange: (status: string) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
}

export function AssignmentsFilter({ statusFilter, onStatusChange, searchQuery, onSearchChange }: AssignmentsFilterProps) {
    const { t } = useTranslation();

    const statuses = [
        { value: "ALL", label: t("INSTITUTION_ASSIGNMENTS.FILTER.ALL") || "All Assignments" },
        { value: "ACTIVE", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ACTIVE") },
        { value: "ONGOING", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.ONGOING") },
        { value: "COMPLETED", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.COMPLETED") },
        { value: "CANCELLED", label: t("INSTITUTION_ASSIGNMENTS.TABLE.STATUS.CANCELLED") },
    ];

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Search Bar */}
                <div className="relative w-full sm:max-w-md group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                        <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-300" />
                    </div>
                    <Input
                        placeholder={t("INSTITUTION_ASSIGNMENTS.FILTER.SEARCH_PLACEHOLDER") || "Search by worker..."}
                        className="pl-10 h-11 bg-card/60 border-border/60 rounded-xl focus-visible:ring-primary/30 focus-visible:border-primary transition-all duration-300 shadow-sm"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>
            </div>
            {/* Status Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted/50 border border-border/50 shrink-0">
                    <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <div className="h-6 w-px bg-border/60 mx-1 shrink-0 hidden sm:block" />
                {statuses.map((status) => {
                    const isActive = statusFilter === status.value;
                    return (
                        <button
                            key={status.value}
                            onClick={() => onStatusChange(status.value)}
                            className={cn(
                                "flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 whitespace-nowrap border",
                                isActive
                                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                                    : "bg-card/50 text-muted-foreground border-border/50 hover:bg-muted hover:text-foreground hover:border-border"
                            )}
                        >
                            {status.label}
                        </button>
                    );
                })}
                {statusFilter !== "ALL" && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onStatusChange("ALL")}
                        className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground ml-auto rounded-full"
                    >
                        <X className="h-3 w-3 mr-1" />
                        Clear
                    </Button>
                )}
            </div>
        </div>
    );
}
