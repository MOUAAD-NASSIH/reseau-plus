import {
    Eye,
    Users,
    Calendar,
    MapPin,
    CreditCard,
    Building2,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Mission } from "@/types/mission.types";
import { formatDate, formatCurrency } from "@/lib/formatters";
import { Badge } from "@/components/ui/badge";

interface AdminMissionCardProps {
    mission: Mission;
    view: "grid" | "list";
    onView: (mission: Mission) => void;
}

export function AdminMissionCard({ mission, view, onView }: AdminMissionCardProps) {
    // Stats
    const applicantsCount = (mission as any)._count?.applications || 0;

    // Urgency coloring
    const isHighUrgency = mission.urgency === "HIGH";
    const isMediumUrgency = mission.urgency === "MEDIUM";

    if (view === "grid") {
        return (
            <Card className="group relative border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card overflow-hidden flex flex-col h-full">
                <CardHeader className="p-6 pb-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <StatusBadge status={mission.status} />
                        {(isHighUrgency || isMediumUrgency) && (
                            <Badge variant="outline" className={`
                                ${isHighUrgency ? "border-red-500 text-red-500 bg-red-500/10" : "border-orange-500 text-orange-500 bg-orange-500/10"}
                            `}>
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                {mission.urgency}
                            </Badge>
                        )}
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => onView(mission)}>
                            {mission.title}
                        </h3>
                        {mission.institution && (
                            <p className="text-sm text-muted-foreground font-medium flex items-center gap-1">
                                <Building2 className="h-3.5 w-3.5" />
                                {mission.institution.institutionName}
                            </p>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-2 pb-6 space-y-6 flex-1">
                   <div className="flex items-center text-xs font-medium text-muted-foreground/80 py-1 space-x-3">
                        <span className="flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {mission.location || "Remote"}
                        </span>
                   </div>

                    <div className="flex flex-col gap-3">
                        {/* Refined Stats Row */}
                        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 border border-border/40">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Applicants</span>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-lg">{applicantsCount}</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-border/60" />
                            <div className="flex flex-col gap-0.5 items-end">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Budget</span>
                                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                    {mission.budget ? formatCurrency(mission.budget) : "-"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center text-xs font-medium text-muted-foreground/80 pt-1 bg-muted/30 px-3 py-2 rounded-full w-fit">
                        <Calendar className="h-3.5 w-3.5 mr-2 text-foreground/50" />
                        <span className="truncate">
                            {formatDate(mission.startDate)} - {formatDate(mission.endDate)}
                        </span>
                    </div>
                </CardContent>
                <CardFooter className="p-6 pt-0 mt-auto">
                    <Button
                        variant="outline"
                        className="w-full font-semibold group-hover:border-primary/30 group-hover:text-primary transition-colors bg-transparent border-input"
                        onClick={() => onView(mission)}
                    >
                        <Eye className="mr-2 h-4 w-4"/>
                        View Details
                    </Button>
                </CardFooter>
            </Card>
        );
    }

    return (
        // LIST VIEW (Horizontal Card)
        <div className="group relative flex flex-col md:flex-row items-start md:items-center p-6 bg-card border border-border/60 hover:border-primary/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 gap-6">
            {/* Left: Main Info */}
            <div className="flex-1 space-y-2 min-w-0 w-full">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate" onClick={() => onView(mission)}>
                        {mission.title}
                    </h3>
                    <StatusBadge status={mission.status} />
                    {(isHighUrgency || isMediumUrgency) && (
                        <Badge variant="outline" className={`
                            text-[10px] h-5 px-1.5
                            ${isHighUrgency ? "border-red-500 text-red-500 bg-red-500/10" : "border-orange-500 text-orange-500 bg-orange-500/10"}
                        `}>
                            {mission.urgency}
                        </Badge>
                    )}
                </div>

                {mission.institution && (
                     <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        {mission.institution.institutionName}
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center">
                        <span className="font-mono text-xs text-muted-foreground/60 mr-2">REF: {mission.id}</span>
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {formatDate(mission.createdAt)}
                    </span>
                    <span className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {mission.location || "Remote"}
                    </span>
                    {mission.budget && (
                        <span className="flex items-center">
                            <CreditCard className="h-3.5 w-3.5 mr-2 opacity-70" />
                            {formatCurrency(mission.budget)}
                        </span>
                    )}
                </div>
            </div>

            {/* Right: Stats & Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 mt-2 md:mt-0">
                <div className="flex items-center gap-3 mr-4 w-full sm:w-auto">
                    <div className="flex flex-col items-end">
                        <span className="font-bold text-foreground text-sm flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            {applicantsCount} Applicants
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        className="h-10 px-5 font-semibold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20 rounded-lg flex-1 sm:flex-none"
                        onClick={() => onView(mission)}
                    >
                         <Eye className="mr-2 h-4 w-4"/>
                        View Details
                    </Button>
                </div>
            </div>
        </div>
    );
}
