import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetMissionQuery } from "@/features/api/endpoints/missionEndpoints";
import {
    useGetMissionApplicationsQuery,
    useAcceptApplicationMutation,
    useRejectApplicationMutation,
} from "@/features/api/endpoints/applicationEndpoints";
import { useGetSpecialitiesQuery } from "@/features/api/endpoints/domainEndpoints";
import type { ApplicationStatus, MissionApplication } from "@/types/application.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export function useMissionApplicants() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const missionId = parseInt(id || "0");

    const [statusFilter, setStatusFilter] = useState<ApplicationStatus | "ALL">("ALL");
    const [specialtyFilter, setSpecialtyFilter] = useState<string>("ALL");
    const [experienceRange, setExperienceRange] = useState<number[]>([0, 20]);
    const [selectedApplicant, setSelectedApplicant] = useState<MissionApplication | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: missionData, isLoading: missionLoading } = useGetMissionQuery(missionId, {
        skip: !missionId,
    });
    const { data: applicationsData, isLoading: applicationsLoading } = useGetMissionApplicationsQuery(
        {
            missionId,
            filters: statusFilter !== "ALL" ? { status: statusFilter } : undefined,
        },
        { skip: !missionId }
    );
    const { data: specialitiesData } = useGetSpecialitiesQuery();
    const [acceptApplication, { isLoading: isAccepting }] = useAcceptApplicationMutation();
    const [rejectApplication, { isLoading: isRejecting }] = useRejectApplicationMutation();

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];
    const specialities = specialitiesData?.data || [];

    // Client-side filtering
    const filteredApplications = useMemo(() => {
        return applications.filter((app) => {
            const matchesSpecialty = specialtyFilter === "ALL" || app.worker?.speciality?.id.toString() === specialtyFilter;
            const experience = app.worker?.experienceYears || 0;
            const matchesExperience = experience >= experienceRange[0] && experience <= experienceRange[1];
            
            return matchesSpecialty && matchesExperience;
        });
    }, [applications, specialtyFilter, experienceRange]);

    // Calculate stats
    const stats = useMemo(() => {
        const total = filteredApplications.length;
        const pending = filteredApplications.filter(app => app.status === "SUBMITTED").length;
        const accepted = filteredApplications.filter(app => app.status === "ACCEPTED").length;
        
        return { total, pending, accepted };
    }, [filteredApplications]);

    // Pagination
    const paginatedApplications = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredApplications.slice(startIndex, endIndex);
    }, [filteredApplications, currentPage]);

    const totalPages = Math.ceil(filteredApplications.length / itemsPerPage);

    const handleAccept = useCallback(async (applicationId: number) => {
        setProcessingId(applicationId);
        try {
            await acceptApplication({ id: applicationId, missionId }).unwrap();
            showSuccessToast(
                t("MISSION_APPLICANTS.MESSAGES.ACCEPT_SUCCESS"),
                t("MISSION_APPLICANTS.MESSAGES.ACCEPT_SUCCESS_DESC")
            );
            setSelectedApplicant(null);
        } catch (error) {
            showErrorToast(error, t("MISSION_APPLICANTS.MESSAGES.ACCEPT_ERROR"));
        } finally {
            setProcessingId(null);
        }
    }, [acceptApplication, missionId, t]);

    const handleReject = useCallback(async (applicationId: number) => {
        setProcessingId(applicationId);
        try {
            await rejectApplication({ id: applicationId, missionId }).unwrap();
            showSuccessToast(
                t("MISSION_APPLICANTS.MESSAGES.REJECT_SUCCESS"),
                t("MISSION_APPLICANTS.MESSAGES.REJECT_SUCCESS_DESC")
            );
            setSelectedApplicant(null);
        } catch (error) {
            showErrorToast(error, t("MISSION_APPLICANTS.MESSAGES.REJECT_ERROR"));
        } finally {
            setProcessingId(null);
        }
    }, [rejectApplication, missionId, t]);

    const onViewProfile = useCallback((application: MissionApplication) => {
        setSelectedApplicant(application);
    }, []);

    const hasActiveFilters = statusFilter !== "ALL" || specialtyFilter !== "ALL" || experienceRange[0] !== 0 || experienceRange[1] !== 20;

    const resetFilters = () => {
        setStatusFilter("ALL");
        setSpecialtyFilter("ALL");
        setExperienceRange([0, 20]);
    };

    return {
        mission,
        missionLoading,
        applications,
        applicationsLoading,
        specialities,
        filteredApplications,
        paginatedApplications,
        stats,
        totalPages,
        currentPage,
        itemsPerPage,
        setCurrentPage,
        statusFilter,
        setStatusFilter,
        specialtyFilter,
        setSpecialtyFilter,
        experienceRange,
        setExperienceRange,
        selectedApplicant,
        setSelectedApplicant,
        processingId,
        isAccepting,
        isRejecting,
        handleAccept,
        handleReject,
        onViewProfile,
        hasActiveFilters,
        resetFilters
    };
}
