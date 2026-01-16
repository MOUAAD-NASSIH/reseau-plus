import { useState, useMemo } from "react";
import { Link } from "react-router";
import { format } from "date-fns";
import {
    Search,
    MapPin,
    Calendar,
    Building2,
    Zap,
    History,
    FileText,
    ArrowRight,
    Loader2,
    CheckCircle2,
    Shield,
    SlidersHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useGetAvailableMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMyApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import { useGetDomainsQuery, useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";
import { cn } from "@/lib/utils";
import type { Mission } from "@/types/mission.types";

const URGENCY_FILTERS = [
    { value: "HIGH", label: "High Priority", icon: Zap, color: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20" },
    { value: "MEDIUM", label: "Medium", icon: History, color: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20" },
    { value: "LOW", label: "Standard", icon: FileText, color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" },
];

const SORT_OPTIONS = [
    { value: "pay_high", label: "Highest Pay" },
    { value: "urgent", label: "Most Urgent" },
    { value: "nearest", label: "Nearest Location" },
    { value: "newest", label: "Newest First" },
];

export default function AvailableMissions() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
    const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
    const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
    const [distanceRange, setDistanceRange] = useState([15]);
    const [sortBy, setSortBy] = useState("pay_high");
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data: missionsData, isLoading: missionsLoading } = useGetAvailableMissionsQuery();
    const { data: applicationsData } = useGetMyApplicationsQuery();
    const { data: domainsData } = useGetDomainsQuery();
    const { data: specialitiesData } = useGetSpecialitiesQuery();

    const domains = domainsData?.data || [];
    const specialities = specialitiesData?.data || [];

    // Get applied mission IDs
    const appliedMissionIds = useMemo(() => {
        const applications = applicationsData?.data || [];
        return new Set(applications.map((app) => app.missionId));
    }, [applicationsData?.data]);

    // Filter and sort missions
    const filteredMissions = useMemo(() => {
        let missions = missionsData?.data || [];

        // Search filter
        if (searchQuery) {
            missions = missions.filter(
                (mission) =>
                    mission.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    mission.institution?.institutionName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    mission.location?.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Domain filter
        if (selectedDomains.length > 0) {
            missions = missions.filter((mission) => {
                // Check if mission has any of the selected domains
                if (!mission.domains || mission.domains.length === 0) return false;
                return mission.domains.some((md) => {
                    // Handle both domainId and domain.id patterns
                    const domainId = md.domainId ?? md.domain?.id;
                    return domainId && selectedDomains.includes(domainId.toString());
                });
            });
        }

        // Specialty filter
        if (selectedSpecialities.length > 0) {
            missions = missions.filter((mission) =>
                mission.requiredSpecialityId && selectedSpecialities.includes(mission.requiredSpecialityId.toString())
            );
        }

        // Urgency filter
        if (urgencyFilter !== "ALL") {
            missions = missions.filter((mission) => mission.urgency === urgencyFilter);
        }

        // Sort
        const urgencyOrder: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        const sorted = [...missions].sort((a, b) => {
            switch (sortBy) {
                case "pay_high":
                    return (b.budget || 0) - (a.budget || 0);
                case "urgent":
                    return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return sorted;
    }, [missionsData?.data, searchQuery, selectedDomains, selectedSpecialities, urgencyFilter, sortBy]);

    const handleDomainToggle = (domainId: string) => {
        setSelectedDomains((prev) =>
            prev.includes(domainId)
                ? prev.filter((id) => id !== domainId)
                : [...prev, domainId]
        );
    };

    const handleSpecialityToggle = (specialityId: string) => {
        setSelectedSpecialities((prev) =>
            prev.includes(specialityId)
                ? prev.filter((id) => id !== specialityId)
                : [...prev, specialityId]
        );
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedDomains([]);
        setSelectedSpecialities([]);
        setUrgencyFilter("ALL");
        setDistanceRange([15]);
    };

    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (selectedDomains.length > 0) count += selectedDomains.length;
        if (selectedSpecialities.length > 0) count += selectedSpecialities.length;
        if (urgencyFilter !== "ALL") count += 1;
        if (distanceRange[0] !== 15) count += 1;
        return count;
    }, [selectedDomains, selectedSpecialities, urgencyFilter, distanceRange]);

    const getUrgencyBadge = (mission: Mission) => {
        const urgencyConfig = {
            HIGH: {
                label: "URGENT",
                color: "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/25 hover:border-red-500/40 transition-colors",
                icon: Zap
            },
            MEDIUM: {
                label: "MODERATE",
                color: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/25 hover:border-yellow-500/40 transition-colors",
                icon: History
            },
            LOW: {
                label: "STANDARD",
                color: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25 hover:border-blue-500/40 transition-colors",
                icon: FileText
            },
        };

        const config = urgencyConfig[mission.urgency] || urgencyConfig.LOW;
        const Icon = config.icon;

        return (
            <Badge className={cn("px-3 py-1 text-xs font-bold border flex items-center gap-1.5", config.color)}>
                <Icon className="h-3.5 w-3.5" />
                {config.label}
            </Badge>
        );
    };

    // Filter sidebar content (inline to avoid component recreation)
    const filterSidebarContent = (
        <div className="flex flex-col gap-6 h-full">
            {/* Domain Filter */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        Domains
                    </h4>
                    {selectedDomains.length > 0 && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs">
                            {selectedDomains.length}
                        </Badge>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    {domains.slice(0, 8).map((domain) => (
                        <label key={domain.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedDomains.includes(domain.id.toString())}
                                    onChange={() => handleDomainToggle(domain.id.toString())}
                                    className="peer size-5 cursor-pointer appearance-none rounded-md border-2 border-border bg-background checked:bg-primary checked:border-primary transition-all"
                                />
                                <CheckCircle2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {domain.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Specialty Filter */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Specialty
                    </h4>
                    {selectedSpecialities.length > 0 && (
                        <Badge variant="secondary" className="h-5 px-2 text-xs">
                            {selectedSpecialities.length}
                        </Badge>
                    )}
                </div>
                <div className="flex flex-col gap-2">
                    {specialities.slice(0, 6).map((speciality) => (
                        <label key={speciality.id} className="flex items-center gap-3 cursor-pointer group">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedSpecialities.includes(speciality.id.toString())}
                                    onChange={() => handleSpecialityToggle(speciality.id.toString())}
                                    className="peer size-5 cursor-pointer appearance-none rounded-md border-2 border-border bg-background checked:bg-primary checked:border-primary transition-all"
                                />
                                <CheckCircle2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                {speciality.name}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Urgency Filter */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <Zap className="h-4 w-4 text-primary" />
                        Urgency
                    </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setUrgencyFilter("ALL")}
                        className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                            urgencyFilter === "ALL"
                                ? "bg-primary/15 text-primary"
                                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                    >
                        All
                    </button>
                    {URGENCY_FILTERS.map((filter) => {
                        const isSelected = urgencyFilter === filter.value;
                        return (
                            <button
                                key={filter.value}
                                onClick={() => setUrgencyFilter(filter.value)}
                                className={cn(
                                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-all",
                                    isSelected
                                        ? filter.color.replace("bg-", "bg-").replace("/10", "/15")
                                        : "bg-muted/50 hover:bg-muted",
                                    isSelected ? filter.color.replace("bg-", "").replace("/10", "") : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {filter.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Distance Slider */}
            <div>
                <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Distance
                    </h4>
                    <span className="text-sm font-bold text-primary"> {distanceRange[0]} km</span>
                </div>
                <Slider
                    value={distanceRange}
                    onValueChange={setDistanceRange}
                    max={50}
                    step={1}
                    className="mb-2"
                />
                <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                    <span>0km</span>
                    <span>50km</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col lg:flex-row">
            {/* Desktop Sidebar - Sticky */}
            <aside className="hidden lg:block w-80 shrink-0 border-r border-border bg-card/50">
                <div className="sticky top-0 h-screen overflow-y-auto flex flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <SlidersHorizontal className="h-5 w-5 text-primary" />
                            Filters
                            {activeFilterCount > 0 && (
                                <Badge variant="default" className="ml-2 h-5 px-2">
                                    {activeFilterCount}
                                </Badge>
                            )}
                        </h3>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={handleResetFilters}
                                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Search missions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-11 bg-background border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Filters */}
                    <div className="flex-1 overflow-y-auto pr-2">
                        {filterSidebarContent}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Page Header */}
                <div className="shrink-0 px-4 md:px-6 lg:px-8 py-4 lg:py-6 border-b border-border bg-card/30">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-foreground text-3xl lg:text-4xl font-black font-spline leading-tight tracking-tight mb-2">
                                Available Missions
                            </h1>
                            <p className="text-muted-foreground text-base font-spline">
                                Find your next social work contract with ease.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Mobile Filter Button */}
                            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                                <SheetTrigger asChild>
                                    <Button variant="outline" className="lg:hidden gap-2">
                                        <SlidersHorizontal className="h-4 w-4" />
                                        Filters
                                        {activeFilterCount > 0 && (
                                            <Badge variant="default" className="h-5 px-2">
                                                {activeFilterCount}
                                            </Badge>
                                        )}
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="w-80 overflow-y-auto">
                                    <SheetHeader>
                                        <SheetTitle className="flex items-center justify-between">
                                            <span className="flex items-center gap-2">
                                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                                Filters
                                            </span>
                                            {activeFilterCount > 0 && (
                                                <button
                                                    onClick={handleResetFilters}
                                                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                                                >
                                                    Reset all
                                                </button>
                                            )}
                                        </SheetTitle>
                                    </SheetHeader>
                                    <div className="mt-6">
                                        {filterSidebarContent}
                                    </div>
                                </SheetContent>
                            </Sheet>

                            {/* Sort Dropdown */}
                            <div className="flex items-center gap-2">
                                <label className="text-muted-foreground text-sm font-medium whitespace-nowrap hidden sm:block">
                                    Sort by:
                                </label>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-background text-foreground text-xs sm:text-sm pl-4 pr-10 py-2.5 rounded-lg border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer font-light min-w-[140px]"
                                    >
                                        {SORT_OPTIONS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none rotate-90" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Cards List */}
                <div className="flex-1 overflow-y-auto md:px-6 lg:px-8 py-4 lg:py-6">
                    {missionsLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filteredMissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="size-20 rounded-full bg-muted flex items-center justify-center mb-4">
                                <FileText className="h-10 w-10 text-muted-foreground opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-foreground mb-2">No missions found</h3>
                            <p className="text-muted-foreground mb-6 max-w-md">
                                No missions match your current filters. Try adjusting your search criteria.
                            </p>
                            <Button onClick={handleResetFilters} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold">
                                Clear Filters
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {filteredMissions.map((mission) => {
                                const isApplied = appliedMissionIds.has(mission.id);
                                const institutionLogo = mission.institution?.logo;

                                return (
                                    <article
                                        key={mission.id}
                                        className="group relative flex flex-col md:flex-row bg-card rounded-2xl p-4 md:p-5 lg:p-6 gap-4 lg:gap-6 border border-border hover:border-primary/50 hover:shadow-lg transition-all duration-300"
                                    >
                                        {/* Left: Logo */}
                                        <div className="flex md:flex-col justify-between md:justify-start gap-4 md:w-20 shrink-0">
                                            <div className="size-16 md:size-20 rounded-xl bg-background border border-border p-2 overflow-hidden flex items-center justify-center">
                                                {institutionLogo ? (
                                                    <img
                                                        src={institutionLogo}
                                                        alt={mission.institution?.institutionName}
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <Building2 className="h-6 md:h-8 w-6 md:w-8 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>

                                        {/* Middle: Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                {getUrgencyBadge(mission)}
                                                <span className="text-muted-foreground text-xs md:text-sm font-medium flex items-center gap-1.5">
                                                    <Building2 className="h-3.5 w-3.5" />
                                                    {mission.institution?.institutionName || "Institution"}
                                                </span>
                                            </div>

                                            <h3 className="text-foreground text-lg md:text-xl lg:text-2xl font-bold font-spline mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                                {mission.title}
                                            </h3>

                                            <div className="flex flex-wrap gap-x-3 md:gap-x-4 gap-y-2 text-muted-foreground mb-4">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="h-3.5 md:h-4 w-3.5 md:w-4 text-primary" />
                                                    <span className="text-xs md:text-sm font-medium text-foreground">
                                                        {format(new Date(mission.startDate), "MMM d")} -{" "}
                                                        {format(new Date(mission.endDate), "MMM d, yyyy")}
                                                    </span>
                                                </div>
                                                {mission.location && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-3.5 md:h-4 w-3.5 md:w-4 text-primary" />
                                                        <span className="text-xs md:text-sm font-medium text-foreground">
                                                            {mission.location}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Quality Badge */}
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary/10 transition-colors">
                                                    <Shield className="h-3 w-3 mr-1" />
                                                    Verified Institution
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Right: Price & CTA */}
                                        <div className="flex flex-col font-spline gap-3 border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 shrink-0 md:min-w-[180px]">
                                            <div className="flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2">
                                                <div className="text-left md:text-right w-full flex sm:flex-col items-center justify-between gap-2">
                                                    <p className="text-muted-foreground text-xs font-medium mb-1">Total Budget</p>
                                                    <div className="flex items-baseline gap-1.5">
                                                        <p className="text-foreground text-2xl md:text-3xl font-black tracking-tight">
                                                            {Number(mission.budget).toFixed(0)}
                                                        </p>
                                                        <span className="text-primary text-sm md:text-base font-bold">MAD</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                asChild
                                                className={cn(
                                                    "font-bold py-2.5 px-4 rounded-full w-full flex items-center justify-center gap-2 transition-all text-sm",
                                                    isApplied
                                                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 cursor-default hover:bg-emerald-500/20"
                                                        : mission.urgency === "HIGH"
                                                            ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/30"
                                                            : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md shadow-primary/20 hover:shadow-primary/25"
                                                )}
                                                disabled={isApplied}
                                            >
                                                <Link to={`/worker/missions/${mission.id}`}>
                                                    {isApplied ? (
                                                        <>
                                                            <CheckCircle2 className="h-4 w-4" />
                                                            Applied
                                                        </>
                                                    ) : (
                                                        <>
                                                            View Details
                                                            <ArrowRight className="h-4 w-4" />
                                                        </>
                                                    )}
                                                </Link>
                                            </Button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
