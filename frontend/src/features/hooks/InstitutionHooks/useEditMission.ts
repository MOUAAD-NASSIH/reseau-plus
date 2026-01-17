import { useEffect } from "react";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useGetMissionQuery, useUpdateMissionMutation } from "@/features/api/endpoints/missionEndpoints";
import { updateMissionSchema, type UpdateMissionInput } from "@/features/validation/missionSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export const useEditMission = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const missionId = parseInt(id || "0");

    const { data: missionData, isLoading: missionLoading } = useGetMissionQuery(missionId);
    const [updateMission, { isLoading: isUpdating }] = useUpdateMissionMutation();
    const mission = missionData?.data;

    const form = useForm<UpdateMissionInput>({
        resolver: zodResolver(updateMissionSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
            urgency: "MEDIUM",
            status: "OPEN",
            domainIds: [],
            requiredSpecialityId: null,
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (mission) {
            reset({
                title: mission.title || "",
                description: mission.description || "",
                startDate: mission.startDate ? mission.startDate.split("T")[0] : "",
                endDate: mission.endDate ? mission.endDate.split("T")[0] : "",
                location: mission.location || "",
                budget: mission.budget ?? undefined,
                urgency: mission.urgency || "MEDIUM",
                status: mission.status || "OPEN",
                requiredSpecialityId: mission.requiredSpecialityId ?? null,
                domainIds: mission.domains?.map((d) => d.domainId) || [],
            });
        }
    }, [mission, reset]);

    const onSubmit = async (data: UpdateMissionInput) => {
        try {
            // Robust sanitization for the API call
            const sanitizedData = {
                ...data,
                budget: (data.budget === undefined || data.budget === null || isNaN(Number(data.budget))) ? null : Number(data.budget),
                requiredSpecialityId: data.requiredSpecialityId || null,
            };

            await updateMission({ id: missionId, data: sanitizedData }).unwrap();
            showSuccessToast(t("EDIT_MISSION.MESSAGES.SUCCESS"), t("EDIT_MISSION.MESSAGES.SUCCESS_DESC"));
            navigate(`/institution/missions/${missionId}`);
        } catch (error) {
            showErrorToast(error, t("EDIT_MISSION.MESSAGES.ERROR"));
        }
    };

    const onFormError = (err: any) => {
        console.error("Form Validation Errors:", err);
        const errorEntries = Object.entries(err);
        if (errorEntries.length > 0) {
            const [field, error]: [string, any] = errorEntries[0];
            showErrorToast(new Error(`${field}: ${error.message}`), t("COMMON.ERROR") || "Form Validation Failed");
        }
    };

    return {
        form,
        onSubmit,
        onFormError,
        isUpdating,
        missionLoading,
        mission,
        t,
        navigate
    };
};
