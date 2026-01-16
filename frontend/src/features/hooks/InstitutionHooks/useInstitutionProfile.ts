
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import {
    useGetInstitutionProfileQuery,
    useUpdateInstitutionProfileMutation,
} from "@/features/api/endpoints/institutionEndpoints";
import { updateInstitutionProfileSchema, type UpdateInstitutionProfileInput } from "@/features/validation/institutionSchemas";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export const useInstitutionProfile = () => {
    const { t } = useTranslation();
    const { data: profileData, isLoading } = useGetInstitutionProfileQuery();
    const [updateProfile] = useUpdateInstitutionProfileMutation();

    const institution = profileData?.data;

    const form = useForm<UpdateInstitutionProfileInput>({
        resolver: zodResolver(updateInstitutionProfileSchema),
        defaultValues: {
            institutionName: "",
            address: "",
            city: "",
            latitude: undefined,
            longitude: undefined,
        },
    });

    const { reset } = form;

    // Reset form when profile data loads
    useEffect(() => {
        if (institution) {
            reset({
                institutionName: institution.institutionName || "",
                address: institution.address || "",
                city: institution.city || "",
                latitude: institution.latitude || undefined,
                longitude: institution.longitude || undefined,
            });
        }
    }, [institution, reset]);

    const onSubmit = async (data: UpdateInstitutionProfileInput) => {
        try {
            await updateProfile(data).unwrap();
            showSuccessToast(t("COMMON.SUCCESS"), "Your institution profile has been updated successfully.");
        } catch (error) {
            showErrorToast(error, t("COMMON.FAILED_TO_UPDATE"));
        }
    };

    return {
        form,
        institution,
        isLoading,
        onSubmit,
        t,
    };
};
