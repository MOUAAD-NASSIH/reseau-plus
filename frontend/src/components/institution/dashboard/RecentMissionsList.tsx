import { Link } from "react-router";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTranslation } from "react-i18next";
import type { Mission } from "@/types/mission.types";

interface RecentMissionsListProps {
    missions: Mission[];
    isLoading: boolean;
}

export function RecentMissionsList({ missions, isLoading }: RecentMissionsListProps) {
    const { t } = useTranslation();

    return (
        <div className="md:col-span-4 lg:col-span-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground">{t("INSTITUTION_DASHBOARD.SECTIONS.RECENT_MISSIONS")}</h3>
                <Button variant="link" asChild className="text-sm font-medium text-primary hover:text-primary/80 p-0 h-auto">
                    <Link to="/institution/missions">{t("INSTITUTION_DASHBOARD.SECTIONS.VIEW_ALL")}</Link>
                </Button>
            </div>
            <div className="bg-card dark:bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                    ) : missions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">{t("INSTITUTION_DASHBOARD.EMPTY_STATES.NO_MISSIONS")}</p>
                            <Button variant="link" asChild className="mt-2 text-primary">
                                <Link to="/institution/missions/create">{t("INSTITUTION_DASHBOARD.ACTIONS.CREATE_MISSION")}</Link>
                            </Button>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border text-xs uppercase text-muted-foreground bg-muted/50">
                                    <th className="px-6 py-4 font-semibold">{t("INSTITUTION_DASHBOARD.ACTIONS.MISSION_NAME")}</th>
                                    <th className="px-6 py-4 font-semibold">{t("CREATE_MISSION.LOGISTICS.LOCATION_LABEL")}</th>
                                    <th className="px-6 py-4 font-semibold">{t("MY_MISSIONS.TABLE.STATUS")}</th>
                                    <th className="px-6 py-4 font-semibold text-right">{t("MY_MISSIONS.CARD.APPLICANTS")}</th>
                                    <th className="px-6 py-4 font-semibold"></th>
                                </tr>
                            </thead>
                            <tbody className="text-sm">
                                {missions.slice(0, 5).map((mission) => (
                                    <tr key={mission.id} className="group hover:bg-muted/50 transition-colors border-b border-border last:border-0">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-9 w-9 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                    {mission.title.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-foreground">{mission.title}</p>
                                                    <p className="text-xs text-muted-foreground">{t("INSTITUTION_DASHBOARD.ACTIONS.POSTED", { date: new Date(mission.createdAt || new Date()).toLocaleDateString() })}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{mission.location || t("INSTITUTION_DASHBOARD.ACTIONS.REMOTE")}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={mission.status} />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex -space-x-2 overflow-hidden justify-end">
                                                {/* Mock avatars specifically styled like the design */}
                                                {[...Array(Math.min(3, (mission._count?.applications || 0) + 1))].map((_, i) => (
                                                    <Avatar key={i} className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900">
                                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${mission.id}${i}`} />
                                                        <AvatarFallback className="text-[10px]">U{i}</AvatarFallback>
                                                    </Avatar>
                                                ))}
                                                {/* Count Badge */}
                                                {(mission._count?.applications || 0) > 3 && (
                                                    <span className="flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-muted text-[10px] text-muted-foreground font-medium">
                                                        +{mission._count!.applications - 3}
                                                    </span>
                                                )}
                                                 {(!mission._count?.applications && mission.status === "OPEN") && (
                                                     <span className="text-xs text-muted-foreground italic">No applicants</span>
                                                 )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                                        <MoreHorizontal className="h-5 w-5" />
                                                    </button>
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
                    )}
                </div>
            </div>
        </div>
    );
}
