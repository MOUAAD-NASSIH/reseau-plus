
import { useTranslation } from "react-i18next";
import { Star, ThumbsUp, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StarRating } from "@/components/common/StarRating";

interface ReviewsGlobalStatsProps {
    stats: {
        avg: string;
        breakdown: number[];
        positiveRate: number;
        countThisWeek: number;
    };
    totalReviews: number;
    isLoading: boolean;
}

export function ReviewsGlobalStats({ stats, totalReviews, isLoading }: ReviewsGlobalStatsProps) {
    const { t } = useTranslation();

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* OVERALL SCORE */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("REVIEWS.SUMMARY.OVERALL_SCORE")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Star className="h-5 w-5 fill-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-10 w-24 mb-4" />
                    ) : (
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black tracking-tighter">{stats.avg}</span>
                            <span className="text-sm font-bold text-muted-foreground opacity-60">/ 5.0</span>
                        </div>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-4">
                        <StarRating value={parseFloat(stats.avg)} readonly size="h-4 w-4" />
                        <div className="px-3 py-1 bg-muted/30 rounded-full border border-border/40">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{totalReviews} {t("REVIEWS.SUMMARY.TOTAL_REVIEWS")}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* BREAKDOWN */}
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("REVIEWS.SUMMARY.BREAKDOWN")}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2.5">
                        {[5, 4, 3, 2, 1].map((rating, index) => {
                            const percentage = stats.breakdown[index] || 0;
                            return (
                                <div key={rating} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 min-w-[28px]">
                                        <span className="text-[10px] font-black">{rating}</span>
                                        <Star className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
                                    </div>
                                    <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden border border-border/10">
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
            <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl group hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden hover:-translate-y-1">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-60">
                        {t("REVIEWS.SUMMARY.POSITIVE_RATE")}
                    </CardTitle>
                    <div className="h-10 w-10 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <ThumbsUp className="h-5 w-5 fill-emerald-500" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-black tracking-tighter">
                            {stats.positiveRate}%
                        </span>
                        <div className="flex items-center text-xs text-emerald-500 font-bold bg-emerald-500/5 px-2 py-0.5 rounded-full">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            +2.4%
                        </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-4 font-black leading-relaxed opacity-60 uppercase tracking-widest">
                        {t("REVIEWS.SUMMARY.POSITIVE_DESC")}
                    </p>
                    <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-tight">+{stats.countThisWeek} {t("REVIEWS.SUMMARY.THIS_WEEK")}</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
