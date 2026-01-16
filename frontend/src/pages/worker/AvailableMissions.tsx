import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useGetAvailableMissionsQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMyApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import {
  useGetSpecialitiesQuery,
  useGetDomainsQuery,
} from "@/features/api/endpoints/domainEndpoints";

import { KPIStats } from "@/components/common/missions/KPIStats";
import { MissionFilters } from "@/components/common/missions/MissionFilters";
import { MissionGridCard } from "@/components/common/missions/MissionGridCard";
import { MissionList } from "@/components/common/missions/MissionList";
import { baseMissionColumns } from "@/components/common/missions/MissionTableColumns";

import type { Mission, Urgency } from "@/types/mission.types";
import { AlertTriangle, Briefcase, CheckCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AvailableMissionsPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"grid" | "table">("table");

  const { data: missionsData, isLoading } = useGetAvailableMissionsQuery();
  const { data: appsData } = useGetMyApplicationsQuery();
  const { data: specsData } = useGetSpecialitiesQuery();
  const { data: domainsData } = useGetDomainsQuery();

  const missions = missionsData?.data ?? [];
  const specialities = specsData?.data ?? [];
  const domains = domainsData?.data ?? [];

  const appliedIds = useMemo(() => {
    const apps = appsData?.data || [];
    return new Set(apps.map((a) => a.missionId));
  }, [appsData?.data]);

  const [filters, setFilters] = useState({
    search: "",
    speciality: "ALL",
    domain: "ALL",
    urgency: "ALL" as Urgency | "ALL",
  });

  const filtered = useMemo(() => {
    return missions
      .filter((m) => {
        if (
          filters.speciality !== "ALL" &&
          `${m.requiredSpecialityId ?? ""}` !== filters.speciality
        )
          return false;

        if (
          filters.domain !== "ALL" &&
          !m.domains?.some((d) => `${d.domainId}` === filters.domain)
        )
          return false;

        if (filters.urgency !== "ALL" && m.urgency !== filters.urgency)
          return false;

        const hay = `${m.title} ${m.description ?? ""} ${m.location ?? ""} ${
          m.institution?.institutionName ?? ""
        }`.toLowerCase();
        return !filters.search || hay.includes(filters.search.toLowerCase());
      })
      .map((m) => ({
        ...m,
        isApplied: appliedIds.has(m.id),
      }));
  }, [missions, filters, appliedIds]);

  const resetFilters = () =>
    setFilters({
      search: "",
      speciality: "ALL",
      domain: "ALL",
      urgency: "ALL",
    });

  const columns = baseMissionColumns<Mission>().concat([
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }: any) => (
        <Button asChild size="sm">
          <Link to={`/worker/missions/${row.original.id}`}>
            <Eye className="h-4 w-4 mr-1" /> View
          </Link>
        </Button>
      ),
    },
  ]);

  const urgentCount = missions.filter((m) => m.urgency === "HIGH").length;

  return (
    <div className="space-y-6">
      <KPIStats
        items={[
          { label: "Total", value: missions.length, icon: <Briefcase /> },
          { label: "Matching", value: filtered.length, icon: <CheckCircle /> },
          { label: "Applied", value: appliedIds.size, icon: <CheckCircle /> },
          { label: "Urgent", value: urgentCount, icon: <AlertTriangle /> },
        ]}
      />

      <MissionFilters
        filters={filters}
        setFilters={setFilters}
        resetFilters={resetFilters}
        specialities={specialities}
        domains={domains}
        showDomains
        view={view}
        setView={setView}
      />

      <MissionList
        view={view}
        filtered={filtered}
        isLoading={isLoading}
        columns={columns}
        renderGridItem={(m: any) => (
          <MissionGridCard
            key={m.id}
            m={m}
            applied={m.isApplied}
            showDialog={() => navigate(`/worker/missions/${m.id}`)}
          />
        )}
      />
    </div>
  );
}
