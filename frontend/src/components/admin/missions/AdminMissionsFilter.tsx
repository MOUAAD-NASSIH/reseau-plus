import { Search, Grid, List, Briefcase } from "lucide-react";
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
import type { MissionStatus, Urgency } from "@/types/mission.types";
import type { Speciality } from "@/types/auth.types";

interface AdminMissionsFilterProps {
    search: string;
    setSearch: (value: string) => void;
    statusFilter: MissionStatus | "ALL";
    setStatusFilter: (value: MissionStatus | "ALL") => void;
    specialityFilter: string;
    setSpecialityFilter: (value: string) => void;
    urgencyFilter: Urgency | "ALL";
    setUrgencyFilter: (value: Urgency | "ALL") => void;
    view: "grid" | "list";
    setView: (value: "grid" | "list") => void;
    specialities: Speciality[];
}

export function AdminMissionsFilter({
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    specialityFilter,
    setSpecialityFilter,
    urgencyFilter,
    setUrgencyFilter,
    view,
    setView,
    specialities
}: AdminMissionsFilterProps) {
    const { t } = useTranslation();

    return (
        <div className="space-y-4">
            {/* Main Search Bar */}
            <div className="relative w-full shadow-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                    placeholder={t("ADMIN_MISSIONS.SEARCH_PLACEHOLDER", "Search by title, institution, or location...")}
                    className="pl-12 h-14 bg-card border-none shadow-sm text-lg focus-visible:ring-1 focus-visible:ring-primary/20"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Filters & View Toggle */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between overflow-x-auto pb-1 no-scrollbar">
                <div className="flex items-center gap-2">
                    {/* Status Filters */}
                    <div className="flex p-1 bg-muted/50 rounded-lg border border-border/50">
                        {(["ALL", "OPEN", "ONGOING", "CLOSED"] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status === "ALL" ? "ALL" : status as MissionStatus)}
                                className={`
                                    px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap
                                    ${statusFilter === (status === "ALL" ? "ALL" : status)
                                        ? "bg-white dark:bg-slate-800 text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                                `}
                            >
                                {status === "ALL" ? "All Status" : status}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-border mx-2 hidden md:block" />

                    {/* Speciality Filter */}
                    <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                        <SelectTrigger className="h-10 min-w-[160px] border-border/50 bg-card shadow-sm hover:bg-accent hover:text-accent-foreground px-3 text-sm font-medium rounded-lg">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                                <span className="truncate max-w-[120px]"><SelectValue placeholder="Speciality" /></span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Specialities</SelectItem>
                            {specialities.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                     {/* Urgency Filter */}
                     <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                        <SelectTrigger className="h-10 min-w-[140px] border-border/50 bg-card shadow-sm hover:bg-accent hover:text-accent-foreground px-3 text-sm font-medium rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="truncate max-w-[120px]"><SelectValue placeholder="Urgency" /></span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Urgency</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex bg-muted/50 p-1 rounded-lg border border-border/50 ml-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-md transition-all ${view === "grid" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setView("grid")}
                    >
                        <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 rounded-md transition-all ${view === "list" ? "bg-white dark:bg-slate-800 text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setView("list")}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
