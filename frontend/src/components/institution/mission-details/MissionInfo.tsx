
import { Card, CardContent } from "@/components/ui/card";

interface MissionInfoProps {
    description?: string | null;
    domains?: any[] | null;
    t: (key: string, options?: any) => string;
}

export function MissionInfo({ description, domains, t }: MissionInfoProps) {
    return (
        <Card className="border-border/50 shadow-sm hover:shadow-md transition-all duration-300 bg-card rounded-2xl overflow-hidden">
            <CardContent className="p-8 space-y-8">
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-foreground">
                        {t("MISSION_DETAILS.DESCRIPTION")}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed font-medium whitespace-pre-wrap">
                        {description || t("MISSION_DETAILS.NO_DESCRIPTION")}
                    </p>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-foreground">
                        {t("MISSION_DETAILS.TECHNICAL_REQUIREMENTS")}
                    </h3>
                    <ul className="space-y-4">
                        {domains?.map((domain, index) => (
                            <li key={index} className="flex items-start gap-4 group">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 group-hover:scale-125 transition-transform" />
                                <span className="text-muted-foreground font-medium group-hover:text-foreground transition-colors leading-relaxed">
                                    {domain.isRequired ? t("MISSION_DETAILS.REQUIRED") + " " : ""}{t("MISSION_DETAILS.SPECIALIZATION_DESC", { name: domain.domain?.name })}
                                </span>
                            </li>
                        )) || (
                            <>
                                <li className="flex items-start gap-4"><div className="h-2 w-2 rounded-full bg-primary mt-2" /><span className="text-muted-foreground font-medium">Minimum 5 years experience in social impact or healthcare.</span></li>
                                <li className="flex items-start gap-4"><div className="h-2 w-2 rounded-full bg-primary mt-2" /><span className="text-muted-foreground font-medium">Certification in relevant professional field.</span></li>
                                <li className="flex items-start gap-4"><div className="h-2 w-2 rounded-full bg-primary mt-2" /><span className="text-muted-foreground font-medium">Proven track record of success in similar mission scopes.</span></li>
                            </>
                        )}
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
