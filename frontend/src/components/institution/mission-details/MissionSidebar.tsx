
import { Link } from "react-router";
import { MapPin, AlertTriangle, Users, Tag, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MissionSidebarProps {
    mission: any;
    applicationsCount: number;
    t: (key: string, options?: any) => string;
}

export function MissionSidebar({ mission, applicationsCount, t }: MissionSidebarProps) {
    return (
        <div className="space-y-6 sm:space-y-8 w-full">
            {/* Location + Map Card */}
            <Card className="group relative overflow-hidden rounded-3xl border-border/40 shadow-xl hover:shadow-2xl transition-all duration-500 bg-linear-to-b from-background to-muted/20">
                <div className="relative h-56 sm:h-64 w-full overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
                        alt="Map"
                        className="h-full w-full object-cover transition-all duration-700 grayscale opacity-50 group-hover:opacity-80 group-hover:grayscale-0 scale-110 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-background/90 via-background/10 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border/40 shadow-lg">
                        <p className="text-xs font-bold text-primary tracking-wide flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {mission.location || t("COMMON.REMOTE")}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Meta Information Card */}
            <Card className="rounded-3xl shadow-xl hover:shadow-2xl border-border/40 transition-all duration-500 bg-card">
                <CardContent className="p-6 sm:p-8 space-y-2">
                    {/* Urgency Level */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t("MISSION_DETAILS.URGENCY_LEVEL")}
                            </p>
                        </div>
                        <div
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold text-sm relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
                                mission.urgency === "HIGH"
                                    ? "text-destructive border-2 border-destructive/30 bg-destructive/10"
                                    : mission.urgency === "MEDIUM"
                                        ? "text-chart-4 border-2 border-chart-4/30 bg-chart-4/10"
                                        : "text-chart-2 border-2 border-chart-2/30 bg-chart-2/10"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl",
                                    mission.urgency === "HIGH"
                                        ? "bg-destructive"
                                        : mission.urgency === "MEDIUM"
                                            ? "bg-chart-4"
                                            : "bg-chart-2"
                                )}
                            />
                            <AlertTriangle className="h-5 w-5 shrink-0 ml-1" />
                            <span className="font-bold">
                                {t("MISSION_DETAILS.PRIORITY", { priority: t(`MISSION_DETAILS.URGENCY.${mission.urgency.toUpperCase()}`) })}
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                        </div>
                    </div>

                    {/* Required Speciality */}
                    {mission.requiredSpeciality && (
                        <>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-muted-foreground" />
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                        {t("MISSION_DETAILS.REQUIRED_SPECIALTY")}
                                    </p>
                                </div>
                                <Badge
                                    variant="outline"
                                    className="px-3 py-1.5 rounded-xl text-xs font-bold border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 cursor-default"
                                >
                                    {mission.requiredSpeciality.name}
                                </Badge>
                            </div>

                            {/* Divider */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-border/40"></div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Mission Domains */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                {t("MISSION_DETAILS.MISSION_DOMAINS")}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {mission.domains?.length ? (
                                mission.domains.map((d: any, i: number) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-muted/60 border border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all duration-300 hover:scale-105 cursor-default"
                                    >
                                        {d.domain?.name}
                                    </Badge>
                                ))
                            ) : (
                                <Badge className="text-xs">{t("MISSION_DETAILS.NO_DOMAINS")}</Badge>
                            )}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border/40"></div>
                        </div>
                    </div>

                    {/* View Applicants CTA */}
                    <div>
                        <Button
                            variant="outline"
                            asChild
                            className="w-full h-12 rounded-2xl border-2 border-border/70 font-bold shadow-md
                            hover:shadow-lg hover:bg-primary/5 hover:border-primary/50 hover:scale-[1.02]
                            transition-all duration-300 group/btn"
                        >
                            <Link to={`/institution/missions/${mission.id}/applicants`}>
                                <Users className="h-5 w-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                                {t("MISSION_DETAILS.VIEW_ALL_APPLICANTS", { count: applicationsCount })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
