import { Filter, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import type { ApplicationStatus } from "@/types/application.types";
import type { Speciality } from "@/types/auth.types";

interface ApplicantsFilterProps {
    statusFilter: ApplicationStatus | "ALL";
    setStatusFilter: (value: ApplicationStatus | "ALL") => void;
    specialtyFilter: string;
    setSpecialtyFilter: (value: string) => void;
    experienceRange: number[];
    setExperienceRange: (value: number[]) => void;
    hasActiveFilters: boolean;
    resetFilters: () => void;
    specialities: Speciality[];
}

export function ApplicantsFilter({
    statusFilter,
    setStatusFilter,
    specialtyFilter,
    setSpecialtyFilter,
    experienceRange,
    setExperienceRange,
    hasActiveFilters,
    resetFilters,
    specialities
}: ApplicantsFilterProps) {
    const { t } = useTranslation();

    return (
        <Card className="h-fit sticky top-4 hidden lg:block border-none shadow-md bg-card">
            <CardHeader className="pb-4 border-b border-border/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Filter className="h-4 w-4 text-primary" />
                    {t("INSTITUTION_ASSIGNMENTS.FILTER.LABEL")}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
                {/* Status Filter */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("INSTITUTION_ASSIGNMENTS.FILTER.STATUS")}</label>
                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ApplicationStatus | "ALL")}>
                        <SelectTrigger className="w-full bg-muted/30 border-border/60 hover:border-primary/50 transition-colors h-10 px-3">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">{t("MISSION_APPLICANTS.FILTER.ALL")}</SelectItem>
                            <SelectItem value="SUBMITTED">{t("MISSION_APPLICANTS.FILTER.SUBMITTED")}</SelectItem>
                            <SelectItem value="ACCEPTED">{t("MISSION_APPLICANTS.FILTER.ACCEPTED")}</SelectItem>
                            <SelectItem value="REJECTED">{t("MISSION_APPLICANTS.FILTER.REJECTED")}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Specialty Filter */}
                <div className="space-y-2.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t("MISSION_APPLICANTS.FILTER.SPECIALTY")}</label>
                    <Select value={specialtyFilter} onValueChange={setSpecialtyFilter}>
                        <SelectTrigger className="w-full bg-muted/30 border-border/60 hover:border-primary/50 transition-colors h-10 px-3">
                            <SelectValue placeholder={t("MISSION_APPLICANTS.FILTER.ALL_SPECIALTIES")} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Specialties</SelectItem>
                            {specialities.map((spec) => (
                                <SelectItem key={spec.id} value={spec.id.toString()}>
                                    {spec.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Experience Range Filter */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Experience</label>
                        <span className="text-xs text-primary font-bold">
                            {experienceRange[0]}-{experienceRange[1]}+ yrs
                        </span>
                    </div>
                    <Slider
                        min={0}
                        max={20}
                        step={1}
                        value={experienceRange}
                        onValueChange={setExperienceRange}
                        className="w-full py-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase">
                        <span>0 years</span>
                        <span>20+ years</span>
                    </div>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" className="w-full text-primary hover:bg-primary/5 font-bold" onClick={resetFilters}>
                        <X className="h-3.5 w-3.5 mr-2" />
                        Reset Filters
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
