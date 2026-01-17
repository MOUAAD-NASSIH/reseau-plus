import { type UseFormReturn, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { AlertCircle, LayoutDashboard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { CreateMissionInput, UpdateMissionInput } from "@/features/validation/missionSchemas";

interface MissionDetailsFormProps {
    form: UseFormReturn<CreateMissionInput | UpdateMissionInput | any>;
    showStatus?: boolean; 
}

export function MissionDetailsForm({ form, showStatus = false }: MissionDetailsFormProps) {
    const { t } = useTranslation();
    const { register, formState: { errors }, control } = form;

    return (
        <Card className="border shadow-sm bg-card/50 backdrop-blur-sm rounded-2xl">
            <CardContent className="p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary p-1.5 rounded-lg">
                        <LayoutDashboard className="h-4 w-4" />
                    </span>
                    <h3 className="font-bold text-lg">{t("CREATE_MISSION.SECTIONS.DETAILS")}</h3>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="font-medium text-foreground">
                        {t("CREATE_MISSION.DETAILS.TITLE_LABEL")} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                        id="title"
                        className="h-11 md:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
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
                    <Label htmlFor="description" className="font-medium text-foreground">
                        {t("CREATE_MISSION.DETAILS.DESCRIPTION_LABEL")}
                    </Label>
                    <Textarea
                        id="description"
                        className="min-h-[160px] bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all resize-y rounded-xl"
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

                {/* Status (Optional - mostly for Edit) */}
                {showStatus && (
                    <div className="space-y-2">
                        <Label className="font-medium flex items-center gap-2">
                            {t("EDIT_MISSION.ACTIONS.STATUS_LABEL")}
                        </Label>
                        <Controller
                            name="status"
                            control={control}
                            render={({ field }) => (
                                <Select 
                                    value={field.value} 
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger className="h-11 md:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 rounded-xl">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="OPEN" className="text-emerald-600 font-medium">{t("MY_MISSIONS.FILTER.STATUS_OPEN") || "OPEN"}</SelectItem>
                                        <SelectItem value="ONGOING" className="text-blue-600 font-medium">{t("MY_MISSIONS.FILTER.STATUS_ONGOING") || "ONGOING"}</SelectItem>
                                        <SelectItem value="CLOSED" className="text-muted-foreground font-medium">{t("MY_MISSIONS.FILTER.STATUS_CLOSED") || "CLOSED"}</SelectItem>
                                        <SelectItem value="CANCELLED" className="text-destructive font-medium">{t("MY_MISSIONS.FILTER.STATUS_CANCELLED") || "CANCELLED"}</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
