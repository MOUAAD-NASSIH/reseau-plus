import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserCheck, ArrowRight, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import type { Worker } from "@/types/auth.types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PendingValidationPanelProps {
    pendingWorkers: Worker[];
    isLoading: boolean;
    totalCount: number;
}

export function PendingValidationPanel({ pendingWorkers, isLoading, totalCount }: PendingValidationPanelProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-border/40 shadow-2xl bg-card/60 backdrop-blur-xl h-full flex flex-col overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-3 bg-muted/20 border-b border-border/40">
                <CardTitle className="text-lg font-bold tracking-tight flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <UserCheck className="h-5 w-5 text-primary" />
                    </div>
                    {t("ADMIN_DASHBOARD.PENDING_WORKERS.TITLE", "Pending Workers")}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                        <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
                            {totalCount}
                        </span>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" asChild>
                        <Link to="/admin/workers">
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
                {isLoading ? (
                    <div className="space-y-4 p-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-[150px]" />
                                    <Skeleton className="h-3 w-[100px]" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : pendingWorkers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-muted/5 h-full">
                        <div className="bg-background p-4 rounded-full shadow-sm mb-4 border border-border/50">
                            <UserCheck className="h-8 w-8 text-muted-foreground/60" />
                        </div>
                        <p className="text-base font-medium text-foreground">
                            {t("ADMIN_DASHBOARD.PENDING_WORKERS.EMPTY", "All caught up!")}
                        </p>
                        <p className="text-sm text-muted-foreground mt-2 max-w-[240px] leading-relaxed">
                            {t("ADMIN_DASHBOARD.PENDING_WORKERS.EMPTY_DESC", "There are no pending worker validations at the moment.")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {pendingWorkers.slice(0, 5).map((worker) => (
                            <div 
                                key={worker.id}
                                className={cn(
                                    "flex items-center gap-4 p-4 hover:bg-muted/40 transition-all border-b border-border/40 last:border-none group relative overflow-hidden",
                                )}
                            >
                                {/* Hover Effect Indicator */}
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-200" />

                                <Avatar className="h-11 w-11 border-2 border-background shadow-sm group-hover:border-primary/20 transition-colors">
                                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-sm">
                                        {worker.firstName?.[0]}{worker.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="font-semibold text-sm text-foreground truncate pr-2 group-hover:text-primary transition-colors">
                                            {worker.firstName} {worker.lastName}
                                        </h4>
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1 flex-shrink-0 bg-muted/40 px-2 py-0.5 rounded-full border border-border/50">
                                            <Clock className="h-3 w-3" />
                                            {formatDistanceToNow(new Date(worker.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate flex items-center gap-2">
                                            {worker.user?.email || "No email"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            {pendingWorkers.length > 0 && (
                <div className="p-3 bg-muted/20 border-t border-border/40 text-center">
                    <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary text-xs" asChild>
                        <Link to="/admin/workers">
                            {t("COMMON.VIEW_ALL_COUNT", { count: totalCount, defaultValue: `View all ${totalCount} pending requests` })}
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    );
}
