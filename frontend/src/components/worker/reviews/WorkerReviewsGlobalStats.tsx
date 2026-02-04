
import { useTranslation } from "react-i18next";
import { Star, ThumbsUp, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/StarRating";

interface WorkerReviewsGlobalStatsProps {
    stats: {
        avg: string;
        breakdown: number[];
        positiveRate: number;
        countThisWeek: number;
    };
    totalReviews: number;
    isLoading: boolean;
}

export function WorkerReviewsGlobalStats({ stats, totalReviews, isLoading }: WorkerReviewsGlobalStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* OVERALL SCORE */}
            <Card className="border-border/60 shadow-sm bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {t("WORKER_REVIEWS.SUMMARY.OVERALL_SCORE")}
                    </CardTitle>
                    <div className="h-8 w-8 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
                        <Star className="h-5 w-5 fill-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-24 mb-4" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="text-4xl font-bold tracking-tight">{stats.avg}</span>
                            <span className="text-sm font-medium text-muted-foreground">/ 5.0</span>
                        </div>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <StarRating value={parseFloat(stats.avg) || 0} readonly size="sm" />
                        <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-wide">
                            <span className="text-foreground">{totalReviews}</span> {t("WORKER_REVIEWS.SUMMARY.TOTAL_REVIEWS")}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* BREAKDOWN */}
            <Card className="border-border/60 shadow-sm bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {t("WORKER_REVIEWS.SUMMARY.BREAKDOWN")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2.5">
                        {[5, 4, 3, 2, 1].map((rating, index) => {
                            const percentage = stats.breakdown[index] || 0;
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 min-w-[24px]">
                                        <span className="text-xs font-bold">{rating}</span>
                                        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div className="flex-1 h-2.5 bg-muted/50 rounded-full overflow-hidden border border-border/10">
                                        <div
                                            className="h-full bg-primary/80 transition-all duration-1000 ease-out rounded-full shadow-[0_0_8px_rgba(var(--primary),0.2)]"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-[10px] font-black text-muted-foreground min-w-[24px] text-right">
                                        {Math.round(percentage)}%
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* POSITIVE RATE */}
            <Card className="border-border/60 shadow-sm bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        {t("WORKER_REVIEWS.SUMMARY.POSITIVE_RATE")}
                    </CardTitle>
                    <div className="h-8 w-8 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center">
                        <ThumbsUp className="h-4 w-4 fill-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-2">
                        <span className="text-4xl font-bold tracking-tight">
                            {Math.round(stats.positiveRate)}%
                        </span>
                        {/* Static positive trend for now or calculate if history available */}
                        <div className="flex items-center text-xs text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +2.4%
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 font-medium leading-relaxed uppercase tracking-wider">
                        {t("WORKER_REVIEWS.SUMMARY.POSITIVE_DESC")}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">+{stats.countThisWeek} {t("WORKER_REVIEWS.SUMMARY.THIS_WEEK")}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
