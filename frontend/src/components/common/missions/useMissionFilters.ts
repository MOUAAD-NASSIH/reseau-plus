import { useMemo, useState } from "react";
import type { Mission, MissionStatus, Urgency } from "@/types/mission.types";

export interface MissionFiltersState {
  search: string;
  status?: MissionStatus | "ALL";
  urgency: Urgency | "ALL";
  speciality: string;
  domain?: string;
  start?: string;
  end?: string;
}

export function useMissionFilters<T extends Mission>(
  missions: T[],
  applyExtras?: (m: T) => boolean // admin can add date filters etc
) {
  const [filters, setFilters] = useState<MissionFiltersState>({
    search: "",
    urgency: "ALL",
    speciality: "ALL",
  });

  const filtered = useMemo(() => {
    return missions.filter((m) => {
      if (
        filters.speciality !== "ALL" &&
        `${m.requiredSpeciality?.id ?? ""}` !== filters.speciality
      )
        return false;

      if (filters.domain && filters.domain !== "ALL") {
        if (!m.domains?.some((d) => `${d.domainId}` === filters.domain))
          return false;
      }

      if (filters.urgency !== "ALL" && m.urgency !== filters.urgency)
        return false;

      const hay = `${m.title} ${m.description ?? ""} ${m.location ?? ""} ${m.institution?.institutionName ?? ""
        }`
        .toLowerCase()
        .trim();

      if (filters.search && !hay.includes(filters.search.toLowerCase()))
        return false;

      return applyExtras ? applyExtras(m) : true;
    });
  }, [missions, filters, applyExtras]);

  const resetFilters = () =>
    setFilters({
      search: "",
      urgency: "ALL",
      speciality: "ALL",
      domain: "ALL",
    });

  return { filters, setFilters, filtered, resetFilters };
}
