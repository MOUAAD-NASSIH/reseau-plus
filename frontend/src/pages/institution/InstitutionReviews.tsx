import { useState, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Star, User, Calendar, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
    useCreateReviewMutation,
} from "@/features/api/endpoints/reviewEndpoints";
import { useGetInstitutionAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { MissionAssignment } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

function StarRating({
    value,
    onChange,
    readonly = false,
}: {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
}) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"} transition-transform`}
                >
                    <Star
                        className={`h-6 w-6 ${star <= value
                            ? "fill-warning text-warning"
                            : "text-muted-foreground"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

export default function InstitutionReviews() {
    const [searchParams] = useSearchParams();
    const preselectedAssignmentId = searchParams.get("assignmentId");

    const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);

    // Track if we've already processed the preselected assignment
    const hasProcessedPreselection = useRef(false);

    const { data: receivedData, isLoading: receivedLoading } = useGetMyReceivedReviewsQuery();
    const { data: writtenData, isLoading: writtenLoading } = useGetMyWrittenReviewsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetInstitutionAssignmentsQuery({
        status: "COMPLETED",
    });
    const [createReview, { isLoading: isCreatingReview }] = useCreateReviewMutation();

    const receivedReviews = receivedData?.data || [];
    const writtenReviews = writtenData?.data || [];
    const completedAssignments = assignmentsData?.data || [];

    // Filter assignments that haven't been reviewed yet
    const reviewableAssignments = completedAssignments.filter(
        (a) => !writtenReviews.some((r) => r.missionAssignmentId === a.id)
    );

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors, isSubmitting },
    } = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            rating: 5,
            comment: "",
        },
    });

    const rating = watch("rating");

    const openReviewDialog = (assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setValue("missionAssignmentId", assignment.id);
        setValue("rating", 5);
        setValue("comment", "");
        setIsReviewDialogOpen(true);
    };

    // Auto-open review dialog if assignmentId is in URL (only once)
    // Using useLayoutEffect to run synchronously before paint
    useLayoutEffect(() => {
        if (
            preselectedAssignmentId &&
            reviewableAssignments.length > 0 &&
            !hasProcessedPreselection.current &&
            !assignmentsLoading &&
            !writtenLoading
        ) {
            const assignment = reviewableAssignments.find(
                (a) => a.id === parseInt(preselectedAssignmentId)
            );
            if (assignment) {
                hasProcessedPreselection.current = true;
                openReviewDialog(assignment);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedAssignmentId, assignmentsLoading, writtenLoading, reviewableAssignments.length]);

    const closeReviewDialog = () => {
        setIsReviewDialogOpen(false);
        setSelectedAssignment(null);
        reset();
    };

    const onSubmit = async (data: CreateReviewInput) => {
        try {
            await createReview(data).unwrap();
            showSuccessToast("Review submitted", "Your review has been submitted successfully.");
            closeReviewDialog();
        } catch (error) {
            showErrorToast(error, "Failed to submit review. Please try again.");
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    // Calculate average rating received
    const averageReceived =
        receivedReviews.length > 0
            ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(
                1
            )
            : "N/A";

    const isLoading = receivedLoading || writtenLoading || assignmentsLoading;

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                        <Star className="h-4 w-4 text-warning" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{averageReceived}</div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Based on {receivedReviews.length} reviews
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Reviews Written</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">{writtenReviews.length}</div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <Skeleton className="h-8 w-16" />
                        ) : (
                            <div className="text-2xl font-bold">
                                {reviewableAssignments.length}
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground">
                            Workers awaiting your review
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Reviews */}
            {reviewableAssignments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Workers to Review</CardTitle>
                        <CardDescription>
                            Leave a review for workers who completed missions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {reviewableAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between p-3 rounded-lg border bg-card"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                            <User className="h-5 w-5 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {assignment.worker?.firstName}{" "}
                                                {assignment.worker?.lastName}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {assignment.mission?.title}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => openReviewDialog(assignment)}
                                    >
                                        <Star className="h-4 w-4 mr-1" />
                                        Review
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews Tabs */}
            <Card>
                <CardHeader>
                    <CardTitle>Reviews</CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="received">
                        <TabsList className="mb-4">
                            <TabsTrigger value="received">
                                Received ({receivedReviews.length})
                            </TabsTrigger>
                            <TabsTrigger value="written">
                                Written ({writtenReviews.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="received">
                            {receivedLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-24 w-full" />
                                    ))}
                                </div>
                            ) : receivedReviews.length === 0 ? (
                                <EmptyState
                                    icon={Star}
                                    title="No reviews received"
                                    description="You haven't received any reviews from workers yet."
                                />
                            ) : (
                                <div className="space-y-4">
                                    {receivedReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {review.reviewer?.email || "Worker"}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(review.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StarRating value={review.rating} readonly />
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm mt-2 pl-13">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="written">
                            {writtenLoading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <Skeleton key={i} className="h-24 w-full" />
                                    ))}
                                </div>
                            ) : writtenReviews.length === 0 ? (
                                <EmptyState
                                    icon={MessageSquare}
                                    title="No reviews written"
                                    description="You haven't written any reviews for workers yet."
                                />
                            ) : (
                                <div className="space-y-4">
                                    {writtenReviews.map((review) => (
                                        <div
                                            key={review.id}
                                            className="p-4 rounded-lg border bg-card"
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                                        <User className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">
                                                            {review.reviewee?.email || "Worker"}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDate(review.createdAt)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <StarRating value={review.rating} readonly />
                                            </div>
                                            {review.comment && (
                                                <p className="text-sm mt-2 pl-13">
                                                    {review.comment}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Review Dialog */}
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Review Worker</DialogTitle>
                        <DialogDescription>
                            Share your experience working with{" "}
                            {selectedAssignment?.worker?.firstName}{" "}
                            {selectedAssignment?.worker?.lastName}
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Mission Info */}
                        <div className="p-3 rounded-lg bg-muted">
                            <p className="text-sm font-medium">
                                {selectedAssignment?.mission?.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Completed mission
                            </p>
                        </div>

                        {/* Rating */}
                        <div className="space-y-2">
                            <Label>Rating</Label>
                            <StarRating
                                value={rating}
                                onChange={(value) => setValue("rating", value)}
                            />
                            {errors.rating && (
                                <p className="text-sm text-destructive">{errors.rating.message}</p>
                            )}
                        </div>

                        {/* Comment */}
                        <div className="space-y-2">
                            <Label htmlFor="comment">Comment (optional)</Label>
                            <Textarea
                                id="comment"
                                {...register("comment")}
                                placeholder="Share your experience working with this worker..."
                                rows={4}
                            />
                            {errors.comment && (
                                <p className="text-sm text-destructive">{errors.comment.message}</p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeReviewDialog}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting || isCreatingReview}>
                                {isSubmitting || isCreatingReview ? "Submitting..." : "Submit Review"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}

