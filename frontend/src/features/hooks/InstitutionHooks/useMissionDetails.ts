
import { useParams, useNavigate } from "react-router";
import { useTranslation } from "react-i18next";
import { useGetMissionQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMissionApplicationsQuery } from "@/features/api/endpoints/applicationEndpoints";
import { showSuccessToast } from "@/lib/toast";

export const useMissionDetails = () => {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const missionId = parseInt(id || "0");

    const { data: missionData, isLoading: missionLoading } = useGetMissionQuery(missionId);
    const { 
        data: applicationsData, 
        isLoading: applicationsLoading 
    } = useGetMissionApplicationsQuery({ missionId });

    const mission = missionData?.data;
    const applications = applicationsData?.data || [];
    const activeApplicants = applications.filter(app => app.status === "SUBMITTED" || app.status === "ACCEPTED").length;
    const isLoading = missionLoading || applicationsLoading;

    const handleShare = () => {
        const url = window.location.href;
        navigator.clipboard.writeText(url);
        showSuccessToast(t("COMMON.SUCCESS"), t("MISSION_DETAILS.MESSAGES.LINK_COPIED"));
    };

    return {
        mission,
        applications,
        activeApplicants,
        isLoading,
        handleShare,
        navigate,
        t,
        missionId
    };
};
