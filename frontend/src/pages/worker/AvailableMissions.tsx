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
    Award,
    Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useGetAvailableMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMyApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import { useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";
import type { Mission } from "@/types/mission.types";

const URGENCY_FILTERS = [
    { value: "HIGH", label: "High Priority", icon: Zap },
    { value: "ALL", label: "Normal", icon: History },
];

const SORT_OPTIONS = [
    { value: "pay_high", label: "Highest Pay" },
    { value: "urgent", label: "Most Urgent" },
    { value: "nearest", label: "Nearest Location" },
    { value: "newest", label: "Newest First" },
];

export default function AvailableMissions() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialities, setSelectedSpecialities] = useState<string[]>([]);
    const [urgencyFilter, setUrgencyFilter] = useState<string>("ALL");
    const [distanceRange, setDistanceRange] = useState([15]);
    const [sortBy, setSortBy] = useState("pay_high");

    const { data: missionsData, isLoading: missionsLoading } = useGetAvailableMissionsQuery();
    const { data: applicationsData } = useGetMyApplicationsQuery();
    const { data: specialitiesData } = useGetSpecialitiesQuery();

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

        // Speciality filter
        if (selectedSpecialities.length > 0) {
            missions = missions.filter((mission) =>
                selectedSpecialities.includes(mission.requiredSpecialityId?.toString() || "")
            );
        }

        // Urgency filter
        if (urgencyFilter !== "ALL") {
            missions = missions.filter((mission) => mission.urgency === urgencyFilter);
        }

        // Sort
        const sorted = [...missions].sort((a, b) => {
            switch (sortBy) {
                case "pay_high":
                    return (b.budget || 0) - (a.budget || 0);
                case "urgent":
                    const urgencyOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
                    return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
                case "newest":
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                default:
                    return 0;
            }
        });

        return sorted;
    }, [missionsData?.data, searchQuery, selectedSpecialities, urgencyFilter, sortBy]);

    const handleSpecialityToggle = (specialityId: string) => {
        setSelectedSpecialities((prev) =>
            prev.includes(specialityId)
                ? prev.filter((id) => id !== specialityId)
                : [...prev, specialityId]
        );
    };

    const handleResetFilters = () => {
        setSearchQuery("");
        setSelectedSpecialities([]);
        setUrgencyFilter("ALL");
        setDistanceRange([15]);
    };

    const getUrgencyBadge = (mission: Mission) => {
        if (mission.urgency === "HIGH") {
            return (
                <span className="bg-primary text-background-dark text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5" />
                    URGENT
                </span>
            );
        } else if (mission.urgency === "MEDIUM") {
            return (
                <span className="bg-[#234832] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <History className="h-3.5 w-3.5" />
                    MEDIUM PRIORITY
                </span>
            );
        } else {
            return (
                <span className="bg-[#234832] text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                    <FileText className="h-3.5 w-3.5" />
                    STANDARD
                </span>
            );
        }
    };

    return (
        <div className="h-screen bg-background-dark flex overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 shrink-0 flex flex-col gap-3 p-4 border-r border-border-dark">
                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <Input
                        type="text"
                        placeholder="Search missions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-surface-dark border-border-dark text-white placeholder:text-text-muted h-11 rounded-full"
                    />
                </div>

                {/* Filters Container */}
                <div className="bg-surface-dark rounded-2xl pt-3 px-3 pb-2 border border-border-dark flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-white text-lg font-bold">Filters</h3>
                        <button
                            onClick={handleResetFilters}
                            className="text-primary text-sm font-medium hover:underline"
                        >
                            Reset all
                        </button>
                    </div>

                    {/* Specialty Filter */}
                    <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider opacity-80">
                            Specialty
                        </h4>
                        <div className="flex flex-col gap-2">
                            {specialities.slice(0, 6).map((speciality) => (
                                <label key={speciality.id} className="flex items-center gap-3 cursor-pointer group">
                                    <div className="relative flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedSpecialities.includes(speciality.id.toString())}
                                            onChange={() => handleSpecialityToggle(speciality.id.toString())}
                                            className="peer size-5 cursor-pointer appearance-none rounded-md border border-secondary-text bg-transparent checked:bg-primary checked:border-primary transition-all"
                                        />
                                        <CheckCircle2 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-3.5 w-3.5 text-background-dark opacity-0 peer-checked:opacity-100 pointer-events-none" />
                                    </div>
                                    <span className="text-secondary-text group-hover:text-white transition-colors">
                                        {speciality.name}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Urgency Filter */}
                    <div className="mb-4">
                        <h4 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider opacity-80">
                            Urgency
                        </h4>
                        <div className="flex flex-wrap gap-2">
                            {URGENCY_FILTERS.map((filter) => {
                                return (
                                    <button
                                        key={filter.value}
                                        onClick={() => setUrgencyFilter(filter.value)}
                                        className={`px-4 py-2 rounded-full font-bold text-sm border transition-all ${
                                            urgencyFilter === filter.value
                                                ? "bg-primary text-background-dark border-transparent shadow-[0_0_10px_rgba(43,238,121,0.3)]"
                                                : "bg-[#234832] text-secondary-text hover:text-white border-transparent hover:border-secondary-text"
                                        }`}
                                    >
                                        {filter.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Distance Slider */}
                    <div className="mb-0">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="text-white font-semibold text-xs uppercase tracking-wider opacity-80">
                                Distance
                            </h4>
                            <span className="text-primary font-bold text-sm">&lt; {distanceRange[0]} km</span>
                        </div>
                        <Slider
                            value={distanceRange}
                            onValueChange={setDistanceRange}
                            max={50}
                            step={1}
                            className="mb-1"
                        />
                        <div className="flex justify-between mt-1 text-xs text-secondary-text">
                            <span>0km</span>
                            <span>50km</span>
                        </div>
                    </div>
                </div>

                {/* Promo Card */}
                <div className="bg-linear-to-br from-primary/20 to-primary/5 rounded-2xl p-4 border border-primary/20">
                    <div className="flex items-start gap-3">
                        <Award className="text-primary h-6 w-6 shrink-0" />
                        <div>
                            <h5 className="text-white font-bold text-base mb-1">Get Verified</h5>
                            <p className="text-secondary-text text-xs mb-2">
                                Complete your profile to unlock premium missions with higher rates.
                            </p>
                            <button className="text-primary font-bold text-sm hover:underline">
                                Complete Profile →
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Page Header - Fixed */}
                <div className="flex-shrink-0 p-4 lg:p-6 border-b border-border-dark">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-white text-4xl lg:text-5xl font-black leading-tight tracking-tight mb-2">
                                Available Missions
                            </h1>
                            <p className="text-secondary-text text-lg">
                                Browse opportunities tailored to your expertise.
                            </p>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-3">
                            <label className="text-secondary-text text-sm font-medium whitespace-nowrap">
                                Sort by:
                            </label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="appearance-none bg-surface-dark text-white pl-4 pr-10 py-3 rounded-xl border border-[#234832] focus:border-primary focus:outline-none cursor-pointer font-medium min-w-45"
                                >
                                    {SORT_OPTIONS.map((option) => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                <ArrowRight className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary pointer-events-none rotate-90" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission Cards List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-4 lg:p-6">{missionsLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                ) : filteredMissions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="size-20 rounded-full bg-surface-dark flex items-center justify-center mb-4">
                            <FileText className="h-10 w-10 text-text-muted opacity-50" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No missions found</h3>
                        <p className="text-text-muted mb-6 max-w-md">
                            No missions match your current filters. Try adjusting your search criteria.
                        </p>
                        <Button onClick={handleResetFilters} className="bg-primary hover:bg-[#20bd5e] text-background-dark font-bold">
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-5">{filteredMissions.map((mission) => {
                            const isApplied = appliedMissionIds.has(mission.id);
                            const institutionLogo = mission.institution?.logo;

                            return (
                                <article
                                    key={mission.id}
                                    className="group relative flex flex-col lg:flex-row bg-surface-dark rounded-[2rem] p-6 lg:p-8 gap-6 border border-[#234832] hover:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-primary/5"
                                >
                                    {/* Left: Logo */}
                                    <div className="flex lg:flex-col justify-between lg:justify-start gap-4 lg:w-24 shrink-0">
                                        <div className="size-16 rounded-2xl bg-white p-2 overflow-hidden flex items-center justify-center">
                                            {institutionLogo ? (
                                                <img
                                                    src={institutionLogo}
                                                    alt={mission.institution?.institutionName}
                                                    className="w-full h-full object-contain"
                                                />
                                            ) : (
                                                <Building2 className="h-8 w-8 text-gray-400" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Middle: Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-3 mb-2">
                                            {getUrgencyBadge(mission)}
                                            <span className="text-secondary-text text-sm font-medium flex items-center gap-1">
                                                <Building2 className="h-4 w-4" />
                                                {mission.institution?.institutionName || "Institution"}
                                            </span>
                                        </div>

                                        <h3 className="text-white text-2xl font-bold mb-4 group-hover:text-primary transition-colors">
                                            {mission.title}
                                        </h3>

                                        <div className="flex flex-wrap gap-y-3 gap-x-6 text-secondary-text mb-6">
                                            <div className="flex items-center gap-2">
                                                <div className="bg-surface-darker p-2 rounded-lg text-primary">
                                                    <Calendar className="h-5 w-5" />
                                                </div>
                                                <span className="text-sm font-medium text-white">
                                                    {format(new Date(mission.startDate), "MMM d")} -{" "}
                                                    {format(new Date(mission.endDate), "MMM d, yyyy")}
                                                </span>
                                            </div>
                                            {mission.location && (
                                                <div className="flex items-center gap-2">
                                                    <div className="bg-surface-darker p-2 rounded-lg text-primary">
                                                        <MapPin className="h-5 w-5" />
                                                    </div>
                                                    <span className="text-sm font-medium text-white">
                                                        {mission.location}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Quality Badges */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-semibold text-secondary-text uppercase tracking-wide mr-2">
                                                Certified Quality:
                                            </span>
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#234832]/50 border border-[#234832] text-xs text-[#92c9a8]">
                                                <Shield className="h-3.5 w-3.5" />
                                                Top Rated
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right: Price & CTA */}
                                    <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-[#234832] pt-4 lg:pt-0 lg:pl-8 shrink-0 min-w-40">
                                        <div className="text-right">
                                            <p className="text-secondary-text text-sm font-medium">Total Budget</p>
                                            <p className="text-white text-3xl font-bold tracking-tight">
                                                €{Number(mission.budget).toFixed(0)}
                                            </p>
                                        </div>
                                        <Button
                                            asChild
                                            className={`${
                                                isApplied
                                                    ? "bg-surface-dark text-white border border-primary/50"
                                                    : mission.urgency === "HIGH"
                                                    ? "bg-primary hover:bg-white text-background-dark"
                                                    : "bg-[#234832] text-white hover:bg-primary hover:text-background-dark"
                                            } hover:scale-105 transition-all font-bold py-3 px-6 rounded-full w-full lg:w-auto flex items-center justify-center gap-2`}
                                            disabled={isApplied}
                                        >
                                            <Link to={`/worker/missions/${mission.id}`}>
                                                {isApplied ? (
                                                    <>
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        Applied
                                                    </>
                                                ) : (
                                                    <>
                                                        Details
                                                        <ArrowRight className="h-5 w-5" />
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

