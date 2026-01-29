import { type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AlertCircle, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { CreateMissionInput, UpdateMissionInput } from "@/features/validation/missionSchemas";

interface MissionDetailsFormProps {
    form: UseFormReturn<CreateMissionInput | UpdateMissionInput | any>;
    showStatus?: boolean;
}

export function MissionDetailsForm({ form }: MissionDetailsFormProps) {
    const { t } = useTranslation();
    const { register, formState: { errors } } = form;

    return (
        <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl">
                        <LayoutDashboard className="h-5 w-5" />
                    </span>
                    <h3 className="font-bold text-lg sm:text-xl font-spline">{t("CREATE_MISSION.SECTIONS.DETAILS")}</h3>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="font-medium text-foreground text-sm sm:text-base">
                        {t("CREATE_MISSION.DETAILS.TITLE_LABEL")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="title"
                        className="h-11 sm:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all rounded-xl placeholder:text-sm"
                        placeholder={t("CREATE_MISSION.DETAILS.TITLE_PLACEHOLDER")}
                        {...register("title")}
                    />
                    {errors.title && (
                        <p className="text-sm text-destructive flex items-center mt-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.title.message as string}
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="font-medium text-foreground text-sm sm:text-base">
                        {t("CREATE_MISSION.DETAILS.DESCRIPTION_LABEL")}
                    </Label>
                    <Textarea
                        id="description"
                        className="min-h-[140px] sm:min-h-[160px] bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all resize-y rounded-xl placeholder:opacity-60 placeholder:text-sm"
                        placeholder={t("CREATE_MISSION.DETAILS.DESCRIPTION_PLACEHOLDER")}
                        {...register("description")}
                    />
                    {errors.description && (
                        <p className="text-sm text-destructive flex items-center mt-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.description.message as string}
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
