import { Search, Grid, List, Briefcase, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
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
    onClearFilters: () => void;
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
    specialities,
    onClearFilters
}: AdminMissionsFilterProps) {
    const { t } = useTranslation();

    const statuses = ["ALL", "OPEN", "ONGOING", "CLOSED"] as const;
    const urgencies = ["ALL", "LOW", "MEDIUM", "HIGH"] as const;

    const activeFiltersCount = [
        statusFilter !== "ALL",
        specialityFilter !== "ALL",
        urgencyFilter !== "ALL"
    ].filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Main Search Bar & Mobile Filter Trigger */}
            <div className="flex gap-2">
                <div className="relative w-full shadow-sm">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        placeholder={t("ADMIN_MISSIONS.SEARCH_PLACEHOLDER", "Search by title, institution, or location...")}
                        className="pl-12 h-12 bg-card border-border/50 shadow-sm text-base focus-visible:ring-1 focus-visible:ring-primary/20 transition-all hover:border-border"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="h-12 w-12 shrink-0 md:hidden border-border/50 bg-card">
                            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-full sm:w-[400px] flex flex-col h-full">
                        <SheetHeader>
                            <SheetTitle>{t("ADMIN_MISSIONS.FILTERS.TITLE", "Filters")}</SheetTitle>
                            <SheetDescription>
                                {t("ADMIN_MISSIONS.FILTERS.SUBTITLE", "Refine your mission search")}
                            </SheetDescription>
                        </SheetHeader>

                        <div className="flex-1 py-6 space-y-6 overflow-y-auto">
                            {/* Mobile Filters Content */}
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    {t("ADMIN_MISSIONS.FILTERS.STATUS", "Status")}
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {statuses.map((status) => (
                                        <Button
                                            key={status}
                                            variant={statusFilter === status ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setStatusFilter(status)}
                                            className="justify-start"
                                        >
                                            {t(`ADMIN_MISSIONS.FILTERS.${status === 'ALL' ? 'ALL' : status}`)}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    {t("ADMIN_MISSIONS.FILTERS.SPECIALITY", "Speciality")}
                                </label>
                                <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                                    <SelectTrigger className="w-full">
                                        <div className="flex items-center gap-2">
                                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                                            <SelectValue placeholder={t("ADMIN_MISSIONS.FILTERS.SPECIALITY")} />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">{t("ADMIN_MISSIONS.FILTERS.ALL_SPECIALITIES")}</SelectItem>
                                        {specialities.map(s => (
                                            <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                    {t("ADMIN_MISSIONS.FILTERS.URGENCY", "Urgency")}
                                </label>
                                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder={t("ADMIN_MISSIONS.FILTERS.URGENCY")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">{t("ADMIN_MISSIONS.FILTERS.ALL_URGENCY")}</SelectItem>
                                        {urgencies.filter(u => u !== "ALL").map(urgency => (
                                            <SelectItem key={urgency} value={urgency}>{t(`ADMIN_MISSIONS.FILTERS.${urgency}`)}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <SheetFooter className="pt-4 border-t mt-auto flex-col sm:flex-row gap-2">
                            <SheetClose asChild>
                                <Button variant="outline" className="w-full sm:w-1/2" onClick={onClearFilters}>
                                    {t("ADMIN_MISSIONS.CLEAR_FILTERS", "Clear Filters")}
                                </Button>
                            </SheetClose>
                            <SheetClose asChild>
                                <Button className="w-full sm:w-1/2">
                                    {t("COMMON.APPLY", "Apply Filters")}
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>

            {/* Desktop Filters Bar */}
            <div className="hidden md:flex gap-4 items-center justify-between">
                <div className="flex items-center gap-3">
                    {/* Status Tabs */}
                    <div className="flex p-1 bg-muted/40 rounded-lg border border-border/40 backdrop-blur-sm">
                        {statuses.map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`
                                    px-3.5 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap
                                    ${statusFilter === status
                                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/60"}
                                `}
                            >
                                {t(`ADMIN_MISSIONS.FILTERS.${status === 'ALL' ? 'ALL' : status}`)}
                            </button>
                        ))}
                    </div>

                    <div className="w-px h-6 bg-border/60 mx-1" />

                    {/* Desktop Selects */}
                    <Select value={specialityFilter} onValueChange={setSpecialityFilter}>
                        <SelectTrigger className="h-9 min-w-[160px] border-border/50 bg-card/50 shadow-sm hover:bg-accent/50 hover:text-accent-foreground px-3 text-xs font-medium rounded-lg">
                            <div className="flex items-center gap-2">
                                <Briefcase className="h-3.5 w-3.5 text-muted-foreground/70" />
                                <span className="truncate max-w-[120px]"><SelectValue placeholder={t("ADMIN_MISSIONS.FILTERS.SPECIALITY")} /></span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t("ADMIN_MISSIONS.FILTERS.ALL_SPECIALITIES")}</SelectItem>
                            {specialities.map(s => (
                                <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                        <SelectTrigger className="h-9 min-w-[130px] border-border/50 bg-card/50 shadow-sm hover:bg-accent/50 hover:text-accent-foreground px-3 text-xs font-medium rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="truncate max-w-[100px]"><SelectValue placeholder={t("ADMIN_MISSIONS.FILTERS.URGENCY")} /></span>
                            </div>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t("ADMIN_MISSIONS.FILTERS.ALL_URGENCY")}</SelectItem>
                            {urgencies.filter(u => u !== "ALL").map(urgency => (
                                <SelectItem key={urgency} value={urgency}>{t(`ADMIN_MISSIONS.FILTERS.${urgency}`)}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {activeFiltersCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClearFilters}
                            className="h-9 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            {t("ADMIN_MISSIONS.CLEAR_FILTERS")}
                        </Button>
                    )}
                </div>

                {/* View Toggle */}
                <div className="flex bg-muted/40 p-1 rounded-lg border border-border/40 backdrop-blur-sm">
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-md transition-all ${view === "grid" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setView("grid")}
                    >
                        <Grid className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-md transition-all ${view === "list" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        onClick={() => setView("list")}
                    >
                        <List className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
