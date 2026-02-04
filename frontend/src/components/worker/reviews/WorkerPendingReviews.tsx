
import { useTranslation } from "react-i18next";
import { Star, Clock, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MissionAssignment } from "@/types/assignment.types";

interface WorkerPendingReviewsProps {
    assignments: MissionAssignment[];
    isLoading: boolean;
    onReview: (assignment: MissionAssignment) => void;
}

export function WorkerPendingReviews({ assignments, isLoading, onReview }: WorkerPendingReviewsProps) {
    const { t } = useTranslation();

    if (isLoading) {
        return (
            <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                    <Card key={i} className="border-dashed">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-2/3" />
                                </div>
                                <Skeleton className="h-9 w-24" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (assignments.length === 0) return null;

    return (
        <Card className="border-primary/10 bg-primary/5 overflow-hidden">
            <CardHeader className="pb-3 pt-5 px-5">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-xs">
                        <Clock className="h-4 w-4" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-primary">{t("WORKER_REVIEWS.PENDING.TITLE")}</CardTitle>
                        <CardDescription>
                            {t("WORKER_REVIEWS.PENDING.DESC")}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className="bg-background/80 backdrop-blur-sm border-primary/10 hover:border-primary/20 hover:shadow-md transition-all duration-200">
                            <CardContent className="p-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="h-9 w-9 border border-border">
                                            <AvatarImage src={assignment.institution?.logo || undefined} />
                                            <AvatarFallback>
                                                <Building2 className="h-5 w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm line-clamp-1">
                                                {assignment.institution?.institutionName}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {assignment.mission?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => onReview(assignment)}
                                        className="shadow-sm h-8 px-4 text-xs font-medium rounded-full"
                                    >
                                        <Star className="h-3.5 w-3.5 mr-2" />
                                        {t("WORKER_REVIEWS.PENDING.BUTTON")}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
