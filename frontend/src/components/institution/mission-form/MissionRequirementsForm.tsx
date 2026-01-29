import { type UseFormReturn, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Tag,
  AlertCircle,
  Clock,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useMissionFormResources } from "@/features/hooks/InstitutionHooks/useMissionFormResources";
import type {
  CreateMissionInput,
  UpdateMissionInput,
} from "@/features/validation/missionSchemas";

interface MissionRequirementsFormProps {
  form: UseFormReturn<CreateMissionInput | UpdateMissionInput | any>;
}

export function MissionRequirementsForm({
  form,
}: MissionRequirementsFormProps) {
  const { t } = useTranslation();
  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form;
  const { domains, specialities, domainsLoading, specialitiesLoading } =
    useMissionFormResources();

  const selectedDomains = watch("domainIds") || [];

  const handleDomainToggle = (domainId: number) => {
    const current = selectedDomains;
    const updated = current.includes(domainId)
      ? current.filter((id: number) => id !== domainId)
      : [...current, domainId];
    setValue("domainIds", updated, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <Card className="border border-border/50 shadow-lg bg-card/80 backdrop-blur-sm rounded-3xl overflow-hidden">
      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-primary/10 text-primary p-2 rounded-xl">
            <TrendingUp className="h-5 w-5" />
          </span>
          <h3 className="font-bold text-lg sm:text-xl font-spline">
            {t("CREATE_MISSION.SECTIONS.CRITERIA")}
          </h3>
        </div>

        {/* Urgency */}
        <div className="space-y-2">
          <Label htmlFor="urgency" className="font-medium text-sm sm:text-base">
            {t("CREATE_MISSION.REQUIREMENTS.URGENCY_LABEL")}
          </Label>
          <Controller
            name="urgency"
            control={control}
            render={({ field }) => {

              const currentValue = field.value || "MEDIUM";
              return (
                <Select
                  value={currentValue}
                  onValueChange={(value) => {
                    // Only update if the value is valid
                    if (value && ["HIGH", "MEDIUM", "LOW"].includes(value)) {
                      field.onChange(value);
                    } else {

                    }
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "h-11 sm:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 rounded-xl",
                      currentValue === "HIGH" ? "border-destructive/50" : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {currentValue === "HIGH" && (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      )}
                      {currentValue === "MEDIUM" && (
                        <Clock className="h-4 w-4 text-orange-500" />
                      )}
                      {currentValue === "LOW" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      <SelectValue
                        placeholder={t(
                          "CREATE_MISSION.REQUIREMENTS.URGENCY_PLACEHOLDER"
                        )}
                      />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="LOW" className="text-green-600 font-medium">
                      {t("CREATE_MISSION.REQUIREMENTS.URGENCY_LOW")}
                    </SelectItem>
                    <SelectItem
                      value="MEDIUM"
                      className="text-orange-600 font-medium"
                    >
                      {t("CREATE_MISSION.REQUIREMENTS.URGENCY_MEDIUM")}
                    </SelectItem>
                    <SelectItem value="HIGH" className="text-destructive font-medium">
                      {t("CREATE_MISSION.REQUIREMENTS.URGENCY_HIGH")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              );
            }}
          />
        </div>

        {/* Specialty */}
        <div className="space-y-2">
          <Label htmlFor="requiredSpecialityId" className="font-medium text-sm sm:text-base">
            {t("CREATE_MISSION.REQUIREMENTS.SPECIALITY_LABEL")} <span className="text-destructive">*</span>
          </Label>
          {specialitiesLoading ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : (
            <Controller
              name="requiredSpecialityId"
              control={control}
              render={({ field }) => {
                const currentValue = field.value?.toString() || "0";
                return (
                  <Select
                    value={currentValue}
                    onValueChange={(val) => {
                      // Only update if the value is valid
                      if (val && val !== "") {
                        field.onChange(val === "0" ? null : parseInt(val));
                      }
                    }}
                  >
                    <SelectTrigger className="h-11 sm:h-12 bg-background border-input focus:ring-2 focus:ring-primary/20 rounded-xl">
                      <SelectValue
                        placeholder={t(
                          "CREATE_MISSION.REQUIREMENTS.SPECIALITY_PLACEHOLDER"
                        )}
                      />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem
                        value="0"
                        className="italic text-muted-foreground"
                      >
                        {t("CREATE_MISSION.REQUIREMENTS.SPECIALITY_PLACEHOLDER")}
                      </SelectItem>
                      {specialities.map((speciality) => (
                        <SelectItem
                          key={speciality.id}
                          value={speciality.id.toString()}
                        >
                          {speciality.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
          )}
          {errors.requiredSpecialityId && (
            <p className="text-sm text-destructive mt-1">
              {errors.requiredSpecialityId.message as string}
            </p>
          )}
        </div>

        {/* Domains */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-medium text-sm sm:text-base">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {t("CREATE_MISSION.REQUIREMENTS.DOMAINS_LABEL")} <span className="text-destructive">*</span>
          </Label>
          {domainsLoading ? (
            <div className="flex gap-2 flex-wrap">
              <Skeleton className="h-8 w-16 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-14 rounded-full" />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {domains.map((domain) => {
                const isSelected = selectedDomains.includes(domain.id);
                return (
                  <Badge
                    key={domain.id}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-3 py-2 transition-all text-xs sm:text-sm border-2 rounded-xl hover:scale-105",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 border-primary shadow-md shadow-primary/20"
                        : "bg-background hover:bg-muted border-input hover:border-primary/50 text-muted-foreground"
                    )}
                    onClick={() => handleDomainToggle(domain.id)}
                  >
                    {domain.name}
                    {isSelected && <CheckCircle2 className="ml-1.5 h-3.5 w-3.5" />}
                  </Badge>
                );
              })}
            </div>
          )}
          {errors.domainIds && (
            <p className="text-sm text-destructive mt-1">
              {errors.domainIds.message as string}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
