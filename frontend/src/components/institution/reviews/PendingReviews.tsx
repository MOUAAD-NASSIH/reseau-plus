import { useTranslation } from "react-i18next";
import { Star, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import type { MissionAssignment } from "@/types/assignment.types";
import { EmptyState } from "@/components/common/EmptyState";

interface PendingReviewsProps {
    assignments: MissionAssignment[];
    isLoading: boolean;
    onReview: (assignment: MissionAssignment) => void;
}

export function PendingReviews({ assignments, isLoading, onReview }: PendingReviewsProps) {
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
        <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-lg">Pending Reviews</CardTitle>
                        <CardDescription>
                            You have {assignments.length} completed missions waiting for your feedback
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                    {assignments.map((assignment) => (
                        <Card key={assignment.id} className="bg-card/50 backdrop-blur-sm border-primary/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                                            <AvatarImage src={assignment.worker?.profilePicture || undefined} />
                                            <AvatarFallback>
                                                <User className="h-5 w-5" />
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {assignment.worker?.firstName} {assignment.worker?.lastName}
                                            </p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">
                                                {assignment.mission?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => onReview(assignment)}
                                        className="shadow-lg shadow-primary/20"
                                    >
                                        <Star className="h-3.5 w-3.5 mr-2" />
                                        Rate Worker
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
