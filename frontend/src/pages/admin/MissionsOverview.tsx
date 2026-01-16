import { useState, useMemo } from "react";
import { useGetAllMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";

import { AdminMissionsHeader } from "@/components/admin/missions/AdminMissionsHeader";
import { AdminMissionsFilter } from "@/components/admin/missions/AdminMissionsFilter";
import { AdminMissionCard } from "@/components/admin/missions/AdminMissionCard";
import { MissionDetailsDialog } from "@/components/common/missions/MissionDetailsDialog";
import { MissionSkeletonList } from "@/components/common/missions/MissionSkeletonList";
import { PaginationControls } from "@/components/common/PaginationControls";

import type { Mission, MissionStatus, Urgency } from "@/types/mission.types";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminMissionsPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [open, setOpen] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MissionStatus | "ALL">("ALL");
  const [specialityFilter, setSpecialityFilter] = useState("ALL");
  const [urgencyFilter, setUrgencyFilter] = useState<Urgency | "ALL">("ALL");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // Default to 9 for grid view

  // Fetch all missions
  const { data: missionsData, isLoading } = useGetAllMissionsQuery(); 
  const { data: specsData } = useGetSpecialitiesQuery();

  const missions = missionsData?.data ?? [];
  const specialities = specsData?.data ?? [];

  // Client-side Filtering
  const filteredMissions = useMemo(() => {
    return missions.filter((m) => {
      // Search Filter
      const searchContent = `${m.title} ${m.description || ""} ${m.location || ""} ${m.institution?.institutionName || ""}`.toLowerCase();
      const matchesSearch = !search || searchContent.includes(search.toLowerCase());

      // Status Filter
      const matchesStatus = statusFilter === "ALL" || m.status === statusFilter;

      // Urgency Filter
      const matchesUrgency = urgencyFilter === "ALL" || m.urgency === urgencyFilter;

      // Speciality Filter
      const matchesSpeciality = specialityFilter === "ALL" || (m.requiredSpecialityId && m.requiredSpecialityId === parseInt(specialityFilter));

      return matchesSearch && matchesStatus && matchesUrgency && matchesSpeciality;
    });
  }, [missions, search, statusFilter, urgencyFilter, specialityFilter]);

  // Client-side Pagination
  const totalItems = filteredMissions.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const paginatedMissions = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredMissions.slice(startIndex, startIndex + pageSize);
  }, [filteredMissions, page, pageSize]);

  const onView = (m: Mission) => {
    setSelectedMission(m);
    setOpen(true);
  };

  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setPage(1); // Reset to first page on filter change
  };

  const clearFilters = () => {
    setSearch("");
    handleFilterChange(setStatusFilter, "ALL");
    handleFilterChange(setSpecialityFilter, "ALL");
    handleFilterChange(setUrgencyFilter, "ALL");
  };

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500 font-spline">
      {/* Header */}
      <AdminMissionsHeader />

      {/* Filters */}
      <AdminMissionsFilter 
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={(v) => handleFilterChange(setStatusFilter, v)}
        specialityFilter={specialityFilter}
        setSpecialityFilter={(v) => handleFilterChange(setSpecialityFilter, v)}
        urgencyFilter={urgencyFilter}
        setUrgencyFilter={(v) => handleFilterChange(setUrgencyFilter, v)}
        view={view}
        setView={setView}
        specialities={specialities}
      />

      {/* Content */}
      {isLoading ? (
        <MissionSkeletonList view={view === "list" ? "table" : "grid"} />
      ) : (
        <>
            {filteredMissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border-2 border-dashed border-border/40 rounded-xl bg-muted/5">
                    <div className="p-6 rounded-full bg-muted/30 ring-1 ring-border/50">
                        <Search className="h-10 w-10 text-muted-foreground/50" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-xl font-semibold">No missions found</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto">
                            No missions match your current filter criteria. Try adjusting your filters or search terms.
                        </p>
                    </div>
                    <Button variant="outline" className="mt-4" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className={view === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"}>
                        {paginatedMissions.map((mission) => (
                            <AdminMissionCard
                                key={mission.id}
                                mission={mission}
                                view={view}
                                onView={onView}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalItems > 0 && (
                        <div className="border-t pt-4">
                            <PaginationControls
                                currentPage={page}
                                totalPages={totalPages}
                                pageSize={pageSize}
                                setPageSize={setPageSize}
                                setPage={setPage}
                                totalItems={totalItems}
                            />
                        </div>
                    )}
                </div>
            )}
        </>
      )}

      <MissionDetailsDialog
        open={open}
        onOpenChange={setOpen}
        mission={selectedMission}
        mode="admin"
      />
    </div>
  );
}

