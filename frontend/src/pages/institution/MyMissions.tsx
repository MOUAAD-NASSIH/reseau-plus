import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MissionSkeletonList } from "@/components/common/missions/MissionSkeletonList";

import { PaginationControls } from "@/components/common/PaginationControls";

import { useMyMissions } from "@/features/hooks/InstitutionHooks/useMyMissions";
import { MissionsHeader } from "@/components/institution/my-missions/MissionsHeader";
import { MissionsFilter } from "@/components/institution/my-missions/MissionsFilter";
import { MissionCard } from "@/components/institution/my-missions/MissionCard";

export default function MyMissions() {
  const {
    t,
    view,
    setView,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    domainFilter,
    setDomainFilter,
    isMissionsLoading,
    missions, // These are now filtered missions
    domains,
    handleDelete,
  } = useMyMissions();

  // Client-side Pagination State
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  // Filter change handler wrapper to reset page
  const handleFilterChange = (setter: any, value: any) => {
    setter(value);
    setPage(1);
  };

  // Calculate Pagination
  const totalItems = missions.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  const paginatedMissions = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return missions.slice(startIndex, startIndex + pageSize);
  }, [missions, page, pageSize]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <MissionsHeader />

      {/* Filter Bar */}
      <MissionsFilter
        search={search}
        setSearch={(v) => handleFilterChange(setSearch, v)}
        statusFilter={statusFilter}
        setStatusFilter={(v) => handleFilterChange(setStatusFilter, v)}
        domainFilter={domainFilter}
        setDomainFilter={(v) => handleFilterChange(setDomainFilter, v)}
        view={view}
        setView={setView}
        domains={domains}
      />

      {/* Content */}
      {isMissionsLoading ? (
        <MissionSkeletonList view={view === "list" ? "table" : "grid"} />
      ) : (
        <>
          {missions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 border-2 border-dashed border-border/40 rounded-xl bg-muted/5">
              <div className="p-6 rounded-full bg-muted/30 ring-1 ring-border/50">
                <Search className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-semibold font-spline">
                  {t("MY_MISSIONS.EMPTY.TITLE")}
                </h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {t("MY_MISSIONS.EMPTY.DESCRIPTION")}
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  handleFilterChange(setSearch, "");
                  handleFilterChange(setStatusFilter, "ALL");
                  handleFilterChange(setDomainFilter, "ALL");
                }}
              >
                {t("MY_MISSIONS.ACTIONS.CLEAR_FILTER")}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div
                className={
                  view === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }
              >
                {paginatedMissions.map((mission) => (
                  <MissionCard
                    key={mission.id}
                    mission={mission}
                    view={view}
                    onDelete={handleDelete}
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
    </div>
  );
}
