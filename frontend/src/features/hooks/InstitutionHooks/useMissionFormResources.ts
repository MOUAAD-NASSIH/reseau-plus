import { useGetDomainsQuery, useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";

export const useMissionFormResources = () => {
    const { data: domainsData, isLoading: domainsLoading } = useGetDomainsQuery();
    const { data: specialitiesData, isLoading: specialitiesLoading } = useGetSpecialitiesQuery();

    const domains = domainsData?.data || [];
    const specialities = specialitiesData?.data || [];

    return {
        domains,
        domainsLoading,
        specialities,
        specialitiesLoading,
    };
};
