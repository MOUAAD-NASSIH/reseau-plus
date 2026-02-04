import { useTranslation } from "react-i18next";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { LogActionType, DateFilterPeriod } from "@/features/api/endpoints/adminEndpoints";

interface AdminLogsFilterProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    actionTypeFilter: LogActionType | "ALL";
    onActionTypeChange: (type: LogActionType | "ALL") => void;
    dateFilter: DateFilterPeriod | "ALL";
    onDateFilterChange: (period: DateFilterPeriod | "ALL") => void;
    actionTypes: LogActionType[];
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

export function AdminLogsFilter({
    searchQuery,
    onSearchChange,
    actionTypeFilter,
    onActionTypeChange,
    dateFilter,
    onDateFilterChange,
    actionTypes,
    clearFilters,
    hasActiveFilters,
}: AdminLogsFilterProps) {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col xl:flex-row gap-4 mb-6 p-1 rounded-2xl bg-muted/20 border border-border/40 shadow-sm backdrop-blur-sm">
            <div className="p-3 w-full flex flex-col lg:flex-row gap-4 rounded-xl bg-card/60 shadow-inner">
                {/* Search Input */}
                <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-hover:text-primary/70 transition-colors" />
                    <Input
                        placeholder={t("ADMIN_LOGS.FILTERS.SEARCH_PLACEHOLDER") || "Search logs..."}
                        className="pl-9 bg-background/50 border-border/50 rounded-lg hover:bg-background/80 focus:bg-background transition-all h-10 font-medium"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    {/* Action Type Filter */}
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1 min-w-[200px]">
                        <Select value={actionTypeFilter} onValueChange={onActionTypeChange}>
                            <SelectTrigger className="w-full sm:w-[200px] bg-background/50 border-border/50 rounded-lg h-10 font-medium">
                                <div className="flex items-center gap-2 truncate text-muted-foreground group-hover:text-foreground transition-colors">
                                    <Filter className="h-3.5 w-3.5 opacity-70" />
                                    <span className="truncate capitalize">
                                        {actionTypeFilter === "ALL"
                                            ? t("ADMIN_LOGS.FILTERS.ALL_ACTIONS")
                                            : actionTypeFilter.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 shadow-xl max-h-[300px]">
                                <SelectItem value="ALL" className="font-medium">{t("ADMIN_LOGS.FILTERS.ALL_ACTIONS")}</SelectItem>
                                {actionTypes.map((type) => (
                                    <SelectItem key={type} value={type} className="capitalize">
                                        {type.replace(/_/g, " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Filter */}
                    <div className="flex items-center gap-2 w-full sm:w-auto flex-1 min-w-[170px]">
                        <Select value={dateFilter} onValueChange={onDateFilterChange}>
                            <SelectTrigger className="w-full sm:w-[170px] bg-background/50 border-border/50 rounded-lg h-10 font-medium">
                                <SelectValue placeholder="Date Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border/40 shadow-xl">
                                <SelectItem value="ALL">{t("ADMIN_LOGS.FILTERS.ALL_TIME")}</SelectItem>
                                <SelectItem value="TODAY">{t("ADMIN_LOGS.FILTERS.TODAY")}</SelectItem>
                                <SelectItem value="YESTERDAY">{t("ADMIN_LOGS.FILTERS.YESTERDAY")}</SelectItem>
                                <SelectItem value="LAST_7_DAYS">{t("ADMIN_LOGS.FILTERS.LAST_7_DAYS")}</SelectItem>
                                <SelectItem value="LAST_30_DAYS">{t("ADMIN_LOGS.FILTERS.LAST_30_DAYS")}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            onClick={clearFilters}
                            size="icon"
                            className="h-10 w-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors shrink-0 hidden sm:flex"
                            title={t("ADMIN_LOGS.FILTERS.CLEAR")}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    )}
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            onClick={clearFilters}
                            className="h-10 rounded-lg text-destructive border-destructive/20 bg-destructive/5 hover:bg-destructive/10 sm:hidden w-full flex items-center justify-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            {t("ADMIN_LOGS.FILTERS.CLEAR")}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
