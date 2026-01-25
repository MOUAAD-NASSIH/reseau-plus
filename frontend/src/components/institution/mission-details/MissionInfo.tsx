
import { FileText, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MissionInfoProps {
    description?: string | null;
    domains?: any[] | null;
    requiredSpeciality?: any | null;
    t: (key: string, options?: any) => string;
}

export function MissionInfo({ description, domains, requiredSpeciality, t }: MissionInfoProps) {
    return (
        <Card className="border-border/50 shadow-xl hover:shadow-2xl transition-all duration-500 bg-card rounded-3xl overflow-hidden group">
            {/* Gradient accent bar */}
            <div className="h-1.5 bg-linear-to-r from-primary via-primary/80 to-primary w-full" />

            <CardContent className="p-6 sm:p-8 lg:p-10 space-y-2">
                {/* Description Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                            <FileText className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground font-spline">
                            {t("MISSION_DETAILS.DESCRIPTION")}
                        </h3>
                    </div>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-medium whitespace-pre-wrap pl-1">
                        {description || t("MISSION_DETAILS.NO_DESCRIPTION")}
                    </p>
                </div>

                {/* Divider */}
                <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/40"></div>
                    </div>
                </div>

                {/* Technical Requirements Section */}
                <div className="space-y-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-chart-2/10 text-chart-2">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-foreground font-spline">
                            {t("MISSION_DETAILS.TECHNICAL_REQUIREMENTS")}
                        </h3>
                    </div>
                    <ul className="space-y-3 sm:space-y-4">
                        {/* Required Speciality */}
                        {requiredSpeciality && (
                            <li className="flex items-start gap-4 group/item">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 group-hover/item:scale-150 transition-transform duration-300" />
                                <span className="text-muted-foreground text-sm sm:text-base font-medium group-hover/item:text-foreground transition-colors leading-relaxed flex-1">
                                    <span className="text-primary font-semibold">{t("MISSION_DETAILS.REQUIRED")} </span>
                                    {t("MISSION_DETAILS.SPECIALIZATION_DESC", { name: requiredSpeciality.name })}
                                </span>
                            </li>
                        )}

                        {/* Domains */}
                        {domains && domains.length > 0 && (
                            domains.map((domain, index) => (
                                <li key={index} className="flex items-start gap-4 group/item">
                                    <div className="h-2 w-2 rounded-full bg-primary mt-2 group-hover/item:scale-150 transition-transform duration-300" />
                                    <span className="text-muted-foreground text-sm sm:text-base font-medium group-hover/item:text-foreground transition-colors leading-relaxed flex-1">
                                        {domain.isRequired ? <span className="text-primary font-semibold">{t("MISSION_DETAILS.REQUIRED")} </span> : <span className="text-primary font-semibold">{t("MISSION_DETAILS.OPTIONAL")} </span>}
                                        {t("MISSION_DETAILS.DOMAIN_DESC", { name: domain.domain?.name })}
                                    </span>
                                </li>
                            ))
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
