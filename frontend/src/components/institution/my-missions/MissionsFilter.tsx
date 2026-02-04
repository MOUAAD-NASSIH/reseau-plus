import { Search, Building2, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { MissionStatus } from "@/types/mission.types";
import type { Domain } from "@/types/auth.types";

interface MissionsFilterProps {
    search: string;
    setSearch: (value: string) => void;
    statusFilter: MissionStatus | "ALL";
    setStatusFilter: (value: MissionStatus | "ALL") => void;
    domainFilter: string;
    setDomainFilter: (value: string) => void;
    view: "grid" | "list";
    setView: (value: "grid" | "list") => void;
    domains: Domain[];
}

export function MissionsFilter({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    domainFilter,
    setDomainFilter,
    view,
    setView,
    domains
}: MissionsFilterProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative w-full shadow-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4.5 sm:size-5 text-muted-foreground" />
                <Input
                    placeholder={t("MY_MISSIONS.SEARCH_PLACEHOLDER")}
                    className="pl-12 h-12 sm:h-14 bg-card border border-input focus-visible:ring-1 focus-visible:ring-primary/20 text-lg placeholder:text-sm"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                    {/* Quick Status Filters as Pills */}
                    <div className="grid grid-cols-2 sm:flex p-1 bg-muted/50 rounded-lg border border-border/50 gap-1 sm:gap-0">
                        {(["ALL", "OPEN", "ONGOING", "CLOSED"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status === "ALL" ? "ALL" : status as MissionStatus)}
                                className={`
                                    px-3 sm:px-4 py-2 sm:py-1.5 rounded-md text-sm font-medium transition-all text-nowrap
                                    ${statusFilter === (status === "ALL" ? "ALL" : status)
                                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                                `}
                            >
                                {status === "ALL" ? t("MY_MISSIONS.FILTER.STATUS_ALL") : t(`MY_MISSIONS.FILTER.STATUS_${status}`)}
                            </button>
                        ))}
                    </div>

                    <div className="hidden sm:block w-px h-6 bg-border mx-2" />

                    <Select value={domainFilter} onValueChange={setDomainFilter}>
                        <SelectTrigger className="h-10 w-full sm:min-w-[160px] border-border/50 bg-card shadow-sm hover:bg-accent hover:text-accent-foreground px-3 text-sm font-medium rounded-lg">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate"><SelectValue placeholder={t("MY_MISSIONS.FILTER.DOMAIN_LABEL")} /></span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t("MY_MISSIONS.FILTER.DOMAIN_ALL")}</SelectItem>
                            {domains.map(d => (
                                <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 w-full sm:w-fit justify-center sm:justify-start">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 flex-1 sm:flex-none sm:w-8 p-0 rounded-md transition-all ${view === "grid" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setView("grid")}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 flex-1 sm:flex-none sm:w-8 p-0 rounded-md transition-all ${view === "list" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setView("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
