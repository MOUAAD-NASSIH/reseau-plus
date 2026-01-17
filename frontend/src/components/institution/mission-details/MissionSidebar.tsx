
import { Link } from "react-router";
import { MapPin, AlertTriangle, Users } from "lucide-react";
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
        <div className="space-y-8 w-full">
            {/* Location + Map */}
            <Card className="group relative overflow-hidden rounded-3xl border-border/40 shadow-md hover:shadow-xl transition-all duration-500 bg-gradient-to-b from-background to-muted/30">
                <div className="relative h-52 w-full overflow-hidden">
                    <img
                        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=1000&auto=format&fit=crop"
                        alt="Map"
                        className="h-full w-full object-cover transition-all duration-[900ms] grayscale opacity-60 group-hover:opacity-90 group-hover:grayscale-0 scale-105 group-hover:scale-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/10 to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 bg-background/90 backdrop-blur-md p-3 rounded-xl border border-border/40 shadow-lg">
                        <p className="text-[11px] font-bold text-primary tracking-wide flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {mission.location || t("COMMON.REMOTE")}
                        </p>
                    </div>
                </div>
            </Card>

            {/* Combined Meta Card */}
            <Card className="rounded-3xl shadow-sm hover:shadow-md border-border/40 transition-all duration-300 bg-card/80 backdrop-blur">
                <CardContent className="p-6 space-y-8">
                    {/* Urgency */}
                    <div className="space-y-2">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.22em]">
                            {t("MISSION_DETAILS.URGENCY_LEVEL")}
                        </p>
                        <div
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold text-sm relative overflow-hidden",
                                mission.urgency === "HIGH"
                                    ? "text-destructive border border-destructive/20 bg-destructive/10"
                                    : mission.urgency === "MEDIUM"
                                        ? "text-chart-4 border border-chart-4/20 bg-chart-4/10"
                                        : "text-primary border border-primary/20 bg-primary/10"
                            )}
                        >
                            <span
                                className={cn(
                                    "absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl",
                                    mission.urgency === "HIGH"
                                        ? "bg-destructive"
                                        : mission.urgency === "MEDIUM"
                                            ? "bg-chart-4"
                                            : "bg-primary"
                                )}
                            />
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {t("MISSION_DETAILS.PRIORITY", { priority: mission.urgency.charAt(0) + mission.urgency.slice(1).toLowerCase() })}
                        </div>
                    </div>

                    {/* Domains */}
                    <div className="space-y-3">
                        <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-[0.22em]">
                            {t("MISSION_DETAILS.MISSION_DOMAINS")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {mission.domains?.length ? (
                                mission.domains.map((d: any, i: number) => (
                                    <Badge
                                        key={i}
                                        variant="secondary"
                                        className="px-3 py-1.5 rounded-2xl text-xs font-semibold bg-muted/50 border border-border/30 hover:bg-primary/10 hover:text-primary transition-colors"
                                    >
                                        {d.domain?.name}
                                    </Badge>
                                ))
                            ) : (
                                <Badge>{t("MISSION_DETAILS.NO_DOMAINS")}</Badge>
                            )}
                        </div>
                    </div>

                    {/* View Applicants CTA */}
                    <div className="pt-1">
                        <Button
                            variant="outline"
                            asChild
                            className="w-full h-11 rounded-2xl border-border/70 font-bold shadow-sm
                            hover:shadow-md hover:bg-primary/5 hover:border-primary/40
                            transition-all duration-300 group"
                        >
                            <Link to={`/institution/missions/${mission.id}/applicants`}>
                                <Users className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                                {t("MISSION_DETAILS.VIEW_ALL_APPLICANTS", { count: applicationsCount })}
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
