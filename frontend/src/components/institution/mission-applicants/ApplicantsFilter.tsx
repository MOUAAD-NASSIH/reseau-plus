import { Filter, X, SlidersHorizontal, Briefcase, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { ApplicationStatus } from "@/types/application.types";
import type { Speciality, Domain } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface ApplicantsFilterProps {
    statusFilter: ApplicationStatus | "ALL";
    setStatusFilter: (value: ApplicationStatus | "ALL") => void;
    specialtyFilter: string;
    setSpecialtyFilter: (value: string) => void;
    experienceRange: number[];
    setExperienceRange: (value: number[]) => void;
    domainFilter: number[];
    setDomainFilter: (value: number[]) => void;
    hasActiveFilters: boolean;
    resetFilters: () => void;
    specialities: Speciality[];
    domains: Domain[];
    className?: string; // Allow custom classes
    isMobile?: boolean; // For styling tweaks
}

export function FilterFields({
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    experienceRange,
    setExperienceRange,
    domainFilter,
    setDomainFilter,
    hasActiveFilters,
    resetFilters,
    specialities,
    domains,
    isMobile
}: Omit<ApplicantsFilterProps, "className">) {
    const { t } = useTranslation();

    const handleDomainChange = (domainId: number, checked: boolean) => {
        if (checked) {
            setDomainFilter([...domainFilter, domainId]);
        } else {
            setDomainFilter(domainFilter.filter((id) => id !== domainId));
        }
    };

    return (
        <div className={cn("space-y-6", isMobile ? "px-1" : "")}>
            {/* Status Filter */}
            <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <SlidersHorizontal className="h-3 w-3" />
                    {t("MISSION_APPLICANTS.FILTER.LABEL")}
                </label>
                <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "ALL")}>
                    <SelectTrigger className="w-full bg-muted/30 border-border/60 hover:border-primary/50 transition-colors h-10 px-3 rounded-lg font-medium">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60">
                        <SelectItem value="ALL">{t("MISSION_APPLICANTS.FILTER.ALL")}</SelectItem>
                        <SelectItem value="SUBMITTED">{t("MISSION_APPLICANTS.FILTER.SUBMITTED")}</SelectItem>
                        <SelectItem value="ACCEPTED">{t("MISSION_APPLICANTS.FILTER.ACCEPTED")}</SelectItem>
                        <SelectItem value="REJECTED">{t("MISSION_APPLICANTS.FILTER.REJECTED")}</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Specialty Filter */}
            <div className="space-y-2.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="h-3 w-3" />
                    {t("MISSION_APPLICANTS.FILTER.SPECIALTY") || t("INSTITUTION_ASSIGNMENTS.FILTER.SPECIALTY")}
                </label>
                <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                    <SelectTrigger className="w-full bg-muted/30 border-border/60 hover:border-primary/50 transition-colors h-10 px-3 rounded-lg font-medium">
                        <SelectValue placeholder={t("MISSION_APPLICANTS.FILTER.ALL_SPECIALTIES")} />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-border/60 max-h-[300px]">
                        <SelectItem value="ALL">{t("MISSION_APPLICANTS.FILTER.ALL_SPECIALTIES")}</SelectItem>
                        {specialities.map((spec) => (
                            <SelectItem key={spec.id} value={spec.id.toString()}>
                                {spec.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Domain Filter */}
            <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    <Shield className="h-3 w-3" />
                    {t("MISSION_APPLICANTS.FILTER.DOMAINS") || "Domaines"}
                </label>
                <div className="space-y-3 pt-1">
                    {domains.length === 0 && (
                        <p className="text-xs text-muted-foreground italic pl-1">No domains available</p>
                    )}
                    {domains.map((domain) => (
                        <div key={domain.id} className="flex items-center space-x-3">
                            <Checkbox
                                id={`domain-${domain.id}`}
                                checked={domainFilter.includes(domain.id)}
                                onCheckedChange={(checked) => handleDomainChange(domain.id, checked as boolean)}
                                className="border-border/60 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label
                                htmlFor={`domain-${domain.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                            >
                                {domain.name}
                            </Label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Experience Range Filter */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                        {t("MISSION_APPLICANTS.FILTER.EXPERIENCE") || "Experience"}
                    </label>
                    <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                        {t("MISSION_APPLICANTS.FILTER.EXPERIENCE_VAL", { min: experienceRange[0], max: experienceRange[1] })}
                    </span>
                </div>
                <div className="px-1">
                    <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={experienceRange}
                        onValueChange={setExperienceRange}
                        className="w-full py-2"
                    />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    <span>{t("MISSION_APPLICANTS.FILTER.YEARS", { count: 0 })}</span>
                    <span>{t("MISSION_APPLICANTS.FILTER.YEARS", { count: 20 })}+</span>
                </div>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-primary hover:bg-primary/5 font-bold rounded-lg h-9"
                    onClick={resetFilters}
                >
                    <X className="h-4 w-4 mr-2" />
                    {t("MISSION_APPLICANTS.FILTER.RESET") || "Reset Filters"}
                </Button>
            )}
        </div>
    );
}

export function ApplicantsFilter(props: ApplicantsFilterProps) {
    const { t } = useTranslation();

    return (
        <Card className={cn("h-fit sticky top-18 border-none shadow-md bg-card rounded-2xl overflow-hidden hidden lg:block", props.className)}>
            <CardHeader className="pb-4 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground font-spline">
                    <Filter className="h-4 w-4 text-primary" />
                    {t("MISSION_APPLICANTS.FILTER.TITLE")}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <FilterFields {...props} />
            </CardContent>
        </Card>
    );
}
