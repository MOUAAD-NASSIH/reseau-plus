import { Link, useNavigate } from "react-router";
import { ChevronRight, Briefcase, MapPin, Users, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useTranslation } from "react-i18next";
import type { Mission } from "@/types/mission.types";

interface RecentMissionsListProps {
    missions: Mission[];
    isLoading: boolean;
}

export function RecentMissionsList({ missions, isLoading }: RecentMissionsListProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold font-spline flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Briefcase className="h-5 w-5" />
                    </div>
                    {t("INSTITUTION_DASHBOARD.SECTIONS.RECENT_MISSIONS")}
                </h2>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/5" asChild>
                    <Link to="/institution/missions" className="gap-1">
                        {t("INSTITUTION_DASHBOARD.SECTIONS.VIEW_ALL")} <ChevronRight className="h-4 w-4" />
                    </Link>
                </Button>
            </div>

            <Card className="border-border bg-card shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-6 space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                ) : missions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mb-4">
                            <Briefcase className="h-6 w-6 text-muted-foreground/50" />
                        </div>
                        <p className="text-lg font-medium text-foreground">{t("INSTITUTION_DASHBOARD.EMPTY_STATES.NO_MISSIONS")}</p>
                        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
                            {t("INSTITUTION_DASHBOARD.MISSIONS.NO_MISSIONS_DESC")}
                        </p>
                        <Button asChild>
                            <Link to="/institution/missions/create">{t("INSTITUTION_DASHBOARD.ACTIONS.CREATE_MISSION")}</Link>
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block relative w-full overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 font-semibold border-b border-border">
                                    <tr>
                                        <th className="px-6 py-4">{t("INSTITUTION_DASHBOARD.ACTIONS.MISSION_NAME")}</th>
                                        <th className="px-6 py-4">{t("CREATE_MISSION.LOGISTICS.LOCATION_LABEL")}</th>
                                        <th className="px-6 py-4">{t("MY_MISSIONS.TABLE.STATUS")}</th>
                                        <th className="px-6 py-4 text-right">{t("MY_MISSIONS.CARD.APPLICANTS")}</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {missions.slice(0, 5).map((mission) => (
                                        <tr
                                            key={mission.id}
                                            className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                            onClick={() => navigate(`/institution/missions/${mission.id}`)}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                                        {mission.title.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{mission.title}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {t("INSTITUTION_DASHBOARD.ACTIONS.POSTED", { date: new Date(mission.createdAt || new Date()).toLocaleDateString() })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="h-3.5 w-3.5 text-muted-foreground/70" />
                                                    {mission.location || t("INSTITUTION_DASHBOARD.ACTIONS.REMOTE")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <StatusBadge status={mission.status} />
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {(mission.applications && mission.applications.length > 0) ? (
                                                        <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
                                                            {mission.applications.slice(0, 3).map((app) => (
                                                                <Avatar key={app.id} className="inline-block h-8 w-8 border border-background ring-2 ring-background transition-transform hover:scale-110 hover:z-10 cursor-pointer" title={`${app.worker.firstName} ${app.worker.lastName}`}>
                                                                    <AvatarImage src={app.worker.user.profilePicture || undefined} />
                                                                    <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                                                                        {app.worker.firstName[0]}{app.worker.lastName[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                            ))}
                                                            {(mission._count?.applications || 0) > 3 && (
                                                                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-[10px] font-medium text-muted-foreground border border-background ring-2 ring-background z-0 hover:z-10 hover:scale-110 transition-transform cursor-default">
                                                                    +{(mission._count?.applications || 0) - 3}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-muted-foreground italic">{t("INSTITUTION_DASHBOARD.ACTIONS.NO_APPLICANTS")}</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/institution/missions/${mission.id}`}>{t("INSTITUTION_DASHBOARD.SECTIONS.VIEW_ALL")}</Link>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem asChild>
                                                            <Link to={`/institution/missions/${mission.id}/applicants`}>{t("INSTITUTION_DASHBOARD.ACTIONS.VIEW_APPLICANTS")}</Link>
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-border">
                            {missions.slice(0, 5).map((mission) => (
                                <div
                                    key={mission.id}
                                    className="p-4 space-y-3 cursor-pointer hover:bg-muted/30 transition-colors active:bg-muted/50"
                                    onClick={() => navigate(`/institution/missions/${mission.id}`)}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                                                {mission.title}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3 w-3" />
                                                    {mission.location || t("INSTITUTION_DASHBOARD.ACTIONS.REMOTE")}
                                                </span>
                                                <span>•</span>
                                                <span>{new Date(mission.createdAt || new Date()).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <StatusBadge status={mission.status} className="shrink-0 h-5 text-[10px] px-1.5" />
                                    </div>
                                    <div className="flex items-center justify-between text-xs pt-1">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{mission._count?.applications || 0} {t("MY_MISSIONS.CARD.APPLICANTS")}</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </Card>
        </section>
    );
}
