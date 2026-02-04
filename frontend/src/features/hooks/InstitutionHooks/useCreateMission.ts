import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { useCreateMissionMutation } from "@/features/api/endpoints/missionEndpoints";
import { createMissionSchema, type CreateMissionInput } from "@/features/validation/missionSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export const useCreateMission = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [createMission, { isLoading: isCreating }] = useCreateMissionMutation();

    const form = useForm<CreateMissionInput>({
        resolver: zodResolver(createMissionSchema),
        defaultValues: {
            title: "",
            description: "",
            startDate: "",
            endDate: "",
            location: "",
            urgency: "MEDIUM",
            domainIds: [],
        },
    });

    const onSubmit = async (data: CreateMissionInput) => {
        try {
            await createMission(data).unwrap();
            showSuccessToast(t("COMMON.SUCCESS"), t("CREATE_MISSION.MESSAGES.SUCCESS_DESC") || "Your mission has been created successfully.");
            navigate("/institution/missions");
        } catch (error) {
            showErrorToast(error, t("COMMON.ERROR") || "Failed to create mission. Please try again.");
        }
    };

    return {
        form,
        onSubmit,
        isCreating,
        t,
        navigate
    };
};
