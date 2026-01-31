import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { UserCheck, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { formatDistanceToNow } from "date-fns";
import type { Worker } from "@/types/auth.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface PendingValidationPanelProps {
    pendingWorkers: Worker[];
    isLoading: boolean;
    totalCount: number;
}

export function PendingValidationPanel({ pendingWorkers, isLoading, totalCount }: PendingValidationPanelProps) {
    const { t } = useTranslation();

    return (
        <Card className="border-none shadow-md bg-card flex flex-col h-full overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between pb-4 pt-6 px-6">
                <CardTitle className="text-base font-semibold font-spline text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                    {t("ADMIN_DASHBOARD.PENDING_WORKERS.TITLE", "Pending Validations")}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {totalCount > 0 && (
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
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
            <CardContent className="flex-1 p-0 px-2 pb-2">
                {isLoading ? (
                    <div className="space-y-4 p-4">
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
                    <div className="flex flex-col items-center justify-center py-12 text-center px-4 bg-muted/5 mx-4 rounded-xl mb-4 border border-dashed border-border/50">
                        <div className="bg-background p-3 rounded-full shadow-sm mb-3">
                            <UserCheck className="h-6 w-6 text-muted-foreground/60" />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {t("ADMIN_DASHBOARD.PENDING_WORKERS.EMPTY", "All caught up!")}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                            {t("ADMIN_DASHBOARD.PENDING_WORKERS.EMPTY_DESC", "No pending validations found")}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        {pendingWorkers.slice(0, 5).map((worker) => (
                            <div
                                key={worker.id}
                                className={cn(
                                    "flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-all group cursor-default",
                                )}
                            >
                                <Avatar className="h-10 w-10 border border-border shadow-sm group-hover:border-primary/20 transition-colors">
                                    <AvatarImage src={worker.profilePicture || worker.user?.profilePicture || undefined} alt={`${worker.firstName} ${worker.lastName}`} />
                                    <AvatarFallback className="bg-primary/5 text-primary font-bold text-xs">
                                        {worker.firstName?.[0]}{worker.lastName?.[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h4 className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">
                                            {worker.firstName} {worker.lastName}
                                        </h4>
                                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(worker.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-muted-foreground truncate">
                                            {worker.user?.email}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            {pendingWorkers.length > 0 && (
                <div className="p-4 pt-0">
                    <Button variant="outline" className="w-full text-xs h-9 border-primary/20 hover:bg-primary/5 hover:text-primary" asChild>
                        <Link to="/admin/workers">
                            {t("ADMIN_DASHBOARD.PENDING_WORKERS.VIEW_ALL", "View All Requests")}
                        </Link>
                    </Button>
                </div>
            )}
        </Card>
    );
}

