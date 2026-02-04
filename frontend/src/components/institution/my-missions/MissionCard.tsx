import { useNavigate } from "react-router";
import {
    Edit,
    Eye,
    Trash2,
    Users,
    Calendar,
    MoreHorizontal,
    MapPin,
    CreditCard
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/common/StatusBadge";
import type { Mission } from "@/types/mission.types";
import { formatDate, formatCurrency } from "@/lib/formatters";

interface MissionCardProps {
    mission: Mission;
    view: "grid" | "list";
    onDelete: (id: number) => void;
}

export function MissionCard({ mission, view, onDelete }: MissionCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Stats
    const applicantsCount = (mission as any)._count?.applications || 0;
    const isActiveHiring = mission.status === "OPEN";

    if (view === "grid") {
        return (
            <Card className="group relative border-border/50 hover:border-primary/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-card overflow-hidden flex flex-col h-full">
                <CardHeader className="p-6 pb-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <StatusBadge status={mission.status} />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => navigate(`/institution/missions/${mission.id}`)}>
                                    <Eye className="mr-2 h-4 w-4" /> {t("MY_MISSIONS.CARD.VIEW_DETAILS")}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigate(`/institution/missions/${mission.id}/edit`)}>
                                    <Edit className="mr-2 h-4 w-4" /> {t("MY_MISSIONS.CARD.EDIT")}
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(mission.id)}>
                                    <Trash2 className="mr-2 h-4 w-4" /> {t("MY_MISSIONS.CARD.DELETE")}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-bold text-lg leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors cursor-pointer font-spline" onClick={() => navigate(`/institution/missions/${mission.id}`)}>
                            {mission.title}
                        </h3>
                        <p className="text-sm text-muted-foreground font-medium flex items-center">
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            {mission.location || t("MY_MISSIONS.CARD.REMOTE")}
                        </p>
                    </div>
                </CardHeader>
                <CardContent className="p-6 pt-2 pb-6 space-y-6 flex-1">
                    <div className="flex flex-col gap-3">
                        {/* Refined Stats Row */}
                        <div className="flex items-center justify-between py-3 px-4 rounded-lg bg-muted/20 border border-border/40">
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t("MY_MISSIONS.CARD.APPLICANTS")}</span>
                                <div className="flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    <span className="font-bold text-lg">{applicantsCount}</span>
                                </div>
                            </div>
                            <div className="h-8 w-px bg-border/60" />
                            <div className="flex flex-col gap-0.5 items-end">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{t("MY_MISSIONS.CARD.BUDGET")}</span>
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
                        onClick={() => navigate(`/institution/missions/${mission.id}/applicants`)}
                    >
                        {t("MY_MISSIONS.CARD.VIEW_APPLICANTS")}
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
                    <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer truncate font-spline" onClick={() => navigate(`/institution/missions/${mission.id}`)}>
                        {mission.title}
                    </h3>
                    <StatusBadge status={mission.status} />
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center">
                        <span className="font-mono text-xs text-muted-foreground/60 mr-2">{t("MY_MISSIONS.CARD.REF")}: {mission.id}</span>
                    </span>
                    <span className="flex items-center">
                        <Calendar className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {t("MY_MISSIONS.CARD.POSTED")} {formatDate(mission.createdAt)}
                    </span>
                    <span className="flex items-center">
                        <MapPin className="h-3.5 w-3.5 mr-2 opacity-70" />
                        {mission.location || t("MY_MISSIONS.CARD.REMOTE")}
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
                    {/* Applicant Avatars Stack */}
                    {(mission as any).applications && (mission as any).applications.length > 0 ? (
                        <div className="flex -space-x-3 hover:space-x-1 transition-all">
                            {(mission as any).applications.slice(0, 3).map((app: any) => (
                                <Avatar
                                    key={app.id}
                                    className="h-9 w-9 border-2 border-background ring-2 ring-background transition-transform hover:z-10 hover:scale-110"
                                    title={`${app.worker.firstName} ${app.worker.lastName}`}
                                >
                                    <AvatarImage src={app.worker.user.profilePicture || undefined} />
                                    <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">
                                        {app.worker.firstName[0]}{app.worker.lastName[0]}
                                    </AvatarFallback>
                                </Avatar>
                            ))}
                            {applicantsCount > 3 && (
                                <div className="h-9 w-9 rounded-full ring-2 ring-background bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-muted-foreground z-0">
                                    +{applicantsCount - 3}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center">
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="font-bold text-foreground text-sm">
                            {(mission as any)._count?.applications || "0"} {t("MY_MISSIONS.CARD.APPLICANTS")}
                        </span>
                        {isActiveHiring && <span className="text-[10px] text-emerald-600 font-medium tracking-tight">{t("MY_MISSIONS.CARD.ACTIVE_HIRING")}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        className="h-10 px-5 font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 rounded-lg flex-1 sm:flex-none"
                        onClick={() => navigate(`/institution/missions/${mission.id}/applicants`)}
                    >
                        {t("MY_MISSIONS.CARD.VIEW_APPLICANTS")}
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/institution/missions/${mission.id}`)}>
                                <Eye className="mr-2 h-4 w-4" /> {t("MY_MISSIONS.CARD.VIEW_DETAILS")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate(`/institution/missions/${mission.id}/edit`)}>
                                <Edit className="mr-2 h-4 w-4" /> {t("MY_MISSIONS.CARD.EDIT")}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(mission.id)}>
                                <Trash2 className="mr-2 h-4 w-4" /> {t("MY_MISSIONS.CARD.DELETE")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </div>
    );
}
