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
            urgency: "MEDIUM" as const,
            status: "OPEN" as const,
            domainIds: [],
            requiredSpecialityId: null,
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (mission) {


            // Ensure urgency is one of the valid enum values
            let validUrgency: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
            if (mission.urgency && typeof mission.urgency === 'string' && mission.urgency.trim() !== "") {
                const upperUrgency = mission.urgency.toUpperCase();
                if (["HIGH", "MEDIUM", "LOW"].includes(upperUrgency)) {
                    validUrgency = upperUrgency as "HIGH" | "MEDIUM" | "LOW";

                } else {

                }
            } else {

            }

            const formData = {
                title: mission.title || "",
                description: mission.description || "",
                startDate: mission.startDate ? mission.startDate.split("T")[0] : "",
                endDate: mission.endDate ? mission.endDate.split("T")[0] : "",
                location: mission.location || "",
                budget: mission.budget !== null && mission.budget !== undefined ? mission.budget : undefined,
                urgency: validUrgency,
                status: mission.status || "OPEN",
                requiredSpecialityId: mission.requiredSpecialityId ?? mission.requiredSpeciality?.id ?? null,
                domainIds: mission.domains?.map((d) => d.domainId) || [],
            };


            reset(formData);
        }
    }, [mission, reset]);

    const onSubmit = async (data: UpdateMissionInput) => {
        try {
            // Ensure urgency is a valid string value
            let urgencyValue: "HIGH" | "MEDIUM" | "LOW" = "MEDIUM";
            if (data.urgency && typeof data.urgency === 'string' && data.urgency.trim() !== "") {
                if (["HIGH", "MEDIUM", "LOW"].includes(data.urgency)) {
                    urgencyValue = data.urgency as "HIGH" | "MEDIUM" | "LOW";
                }
            }

            // Robust sanitization for the API call
            const sanitizedData = {
                ...data,
                budget: (data.budget === undefined || data.budget === null || isNaN(Number(data.budget))) ? null : Number(data.budget),
                requiredSpecialityId: data.requiredSpecialityId || null,
                urgency: urgencyValue,
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
