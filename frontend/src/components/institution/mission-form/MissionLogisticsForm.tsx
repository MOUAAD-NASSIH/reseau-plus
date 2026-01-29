import { type UseFormReturn, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CitySelect } from "@/components/common/CitySelect";
import type { CreateMissionInput, UpdateMissionInput } from "@/features/validation/missionSchemas";

interface MissionLogisticsFormProps {
    form: UseFormReturn<CreateMissionInput | UpdateMissionInput | any>;
}

export function MissionLogisticsForm({ form }: MissionLogisticsFormProps) {
    const { t } = useTranslation();
    const { register, formState: { errors }, control } = form;

    return (
        <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden">
            <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <span className="bg-primary/10 text-primary p-2 rounded-xl">
                        <MapPin className="h-5 w-5" />
                    </span>
                    <h3 className="font-bold text-lg sm:text-xl font-spline">{t("CREATE_MISSION.SECTIONS.LOGISTICS")}</h3>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Start Date */}
                    <div className="space-y-2">
                        <Label htmlFor="startDate" className="font-medium text-sm sm:text-base">
                            {t("CREATE_MISSION.LOGISTICS.START_DATE_LABEL")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="startDate"
                            type="date"
                            className="h-11 sm:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 rounded-xl"
                            {...register("startDate")}
                        />
                        {errors.startDate && (
                            <p className="text-sm text-destructive mt-1">{errors.startDate.message as string}</p>
                        )}
                    </div>

                    {/* End Date */}
                    <div className="space-y-2">
                        <Label htmlFor="endDate" className="font-medium text-sm sm:text-base">
                            {t("CREATE_MISSION.LOGISTICS.END_DATE_LABEL")} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                            id="endDate"
                            type="date"
                            className="h-11 sm:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 rounded-xl"
                            {...register("endDate")}
                        />
                        {errors.endDate && (
                            <p className="text-sm text-destructive mt-1">{errors.endDate.message as string}</p>
                        )}
                    </div>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Location */}
                    <div className="space-y-2">
                        <Label htmlFor="location" className="font-medium text-sm sm:text-base">
                            {t("CREATE_MISSION.LOGISTICS.LOCATION_LABEL")}
                        </Label>
                        <Controller
                            name="location"
                            control={control}
                            render={({ field }) => (
                                <CitySelect
                                    value={field.value ?? undefined}
                                    onChange={field.onChange}
                                    placeholder={t("CREATE_MISSION.LOGISTICS.LOCATION_PLACEHOLDER")}
                                    className="h-11 sm:h-12 rounded-xl"
                                />
                            )}
                        />
                        {errors.location && (
                            <p className="text-sm text-destructive mt-1">{errors.location.message as string}</p>
                        )}
                    </div>

                    {/* Budget */}
                    <div className="space-y-2">
                        <Label htmlFor="budget" className="font-medium flex items-center gap-2 text-sm sm:text-base">
                            {t("CREATE_MISSION.LOGISTICS.BUDGET_LABEL")}
                        </Label>
                        <div className="relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-14 bg-muted/50 flex items-center justify-center border-r border-input rounded-l-xl">
                                <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">MAD</span>
                            </div>
                            <Input
                                id="budget"
                                type="number"
                                step="0.01"
                                className="pl-14 sm:pl-16 h-11 sm:h-12 text-base sm:text-lg font-medium bg-background border-input focus:ring-2 focus:ring-primary/20 transition-all rounded-xl"
                                placeholder="0.00"
                                {...register("budget", { valueAsNumber: true })}
                            />
                        </div>
                        {errors.budget && (
                            <p className="text-sm text-destructive mt-1">{errors.budget.message as string}</p>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
