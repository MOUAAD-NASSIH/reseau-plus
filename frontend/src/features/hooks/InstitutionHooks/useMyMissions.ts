import { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
    useGetMyMissionsQuery,
    useDeleteMissionMutation,
} from "@/features/api/endpoints/missionEndpoints";
import { useGetDomainsQuery } from "@/features/api/endpoints/domainEndpoints";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { MissionStatus } from "@/types/mission.types";

export const useMyMissions = () => {
    const { t } = useTranslation();
    const [view, setView] = useState<"grid" | "list">("grid");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<MissionStatus | "ALL">("ALL");
    const [domainFilter, setDomainFilter] = useState<string>("ALL");

    const [page, setPage] = useState(1);
    const limit = 9;

    // Reset page when filters change
    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setPage(1);
    };

    // Server-side filtering parameters
    const queryParams = useMemo(() => {
        const params: any = {
            page,
            limit,
        };
        if (statusFilter !== "ALL") params.status = statusFilter;
        if (domainFilter !== "ALL") params.domainId = parseInt(domainFilter);
        return params;
    }, [statusFilter, domainFilter, page]);

    const { data: missionsData, isLoading: isMissionsLoading } = useGetMyMissionsQuery(queryParams);
    const { data: domainsData } = useGetDomainsQuery();
    const [deleteMission] = useDeleteMissionMutation();

    const missions = missionsData?.data ?? [];
    const pagination = missionsData?.pagination;
    const domains = domainsData?.data ?? [];

    // Client-side filtering for search
    const filteredMissions = useMemo(() => {
        if (!search) return missions;

        return missions.filter((mission) => {
            return mission.title.toLowerCase().includes(search.toLowerCase()) ||
                mission.id.toString().includes(search);
        });
    }, [missions, search]);

    const handleDelete = useCallback(async (id: number) => {
        try {
            await deleteMission(id).unwrap();
            showSuccessToast(t("MY_MISSIONS.ACTIONS.DELETE"), t("MY_MISSIONS.MESSAGES.DELETE_SUCCESS"));
        } catch (error) {
            showErrorToast(error, t("MY_MISSIONS.MESSAGES.DELETE_ERROR"));
        }
    }, [deleteMission, t]);

    return {
        t,
        view,
        setView,
        search,
        setSearch,
        statusFilter,
        setStatusFilter: (v: any) => handleFilterChange(setStatusFilter, v),
        domainFilter,
        setDomainFilter: (v: any) => handleFilterChange(setDomainFilter, v),
        isMissionsLoading,
        missions: filteredMissions,
        pagination,
        page,
        setPage,
        domains,
        handleDelete,
    };
};
