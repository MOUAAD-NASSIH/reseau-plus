import { useState, useRef, useLayoutEffect } from "react";
import { useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Star, Send, Loader2, MessageSquare, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    useGetMyReceivedReviewsQuery,
    useGetMyWrittenReviewsQuery,
    useCreateReviewMutation,
} from "@/features/api/endpoints/reviewEndpoints";
import { useGetMyAssignmentsQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { Review } from "@/types/review.types";
import type { MissionAssignment } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}

function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-6 w-6",
    };

    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHoverValue(star)}
                    onMouseLeave={() => !readonly && setHoverValue(0)}
                    className={cn(
                        "transition-colors",
                        readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            (hoverValue || value) >= star
                                ? "fill-warning text-warning"
                                : "text-muted-foreground"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

interface ReviewCardProps {
    review: Review;
    type: "received" | "written";
}

function ReviewCard({ review, type }: ReviewCardProps) {
    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                                <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {type === "received"
                                        ? review.reviewer?.email || "Anonymous"
                                        : review.reviewee?.email || "User"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(review.createdAt), "MMM d, yyyy")}
                                </p>
                            </div>
                        </div>
                        <StarRating value={review.rating} readonly size="sm" />
                    </div>
                    {review.comment && (
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface ReviewFormProps {
    assignment: MissionAssignment;
    onSuccess: () => void;
    onCancel: () => void;
}

function ReviewForm({ assignment, onSuccess, onCancel }: ReviewFormProps) {
    const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();
    const [rating, setRating] = useState(0);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            missionAssignmentId: assignment.id,
            rating: 0,
            comment: "",
        },
    });

    const onSubmit = async (data: CreateReviewInput) => {
        try {
            await createReview(data).unwrap();
            showSuccessToast("Review submitted", "Thank you for your feedback!");
            onSuccess();
        } catch (error) {
            showErrorToast(error, "Failed to submit review");
        }
    };

    const handleRatingChange = (value: number) => {
        setRating(value);
        setValue("rating", value, { shouldValidate: true });
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
                <Label>Mission</Label>
                <p className="text-sm text-muted-foreground">
                    {assignment.mission?.title || "Mission"} -{" "}
                    {assignment.institution?.institutionName || "Institution"}
                </p>
            </div>

            <div className="space-y-2">
                <Label>Rating *</Label>
                <StarRating value={rating} onChange={handleRatingChange} size="lg" />
                {errors.rating && (
                    <p className="text-sm text-destructive">{errors.rating.message}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="comment">Comment (optional)</Label>
                <Textarea
                    id="comment"
                    {...register("comment")}
                    placeholder="Share your experience working with this institution..."
                    rows={4}
                />
                {errors.comment && (
                    <p className="text-sm text-destructive">{errors.comment.message}</p>
                )}
            </div>

            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isCreating || rating === 0}>
                    {isCreating ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting...</>
                    ) : (
                        <><Send className="mr-2 h-4 w-4" />Submit Review</>
                    )}
                </Button>
            </div>
        </form>
    );
}

export default function WorkerReviews() {
    const [searchParams] = useSearchParams();
    const preselectedAssignmentId = searchParams.get("assignmentId");

    const { data: receivedData, isLoading: receivedLoading } = useGetMyReceivedReviewsQuery();
    const { data: writtenData, isLoading: writtenLoading } = useGetMyWrittenReviewsQuery();
    const { data: assignmentsData, isLoading: assignmentsLoading } = useGetMyAssignmentsQuery();

    const isLoading = receivedLoading || writtenLoading;

    const [showReviewForm, setShowReviewForm] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<MissionAssignment | null>(null);

    // Track if we've already processed the preselected assignment
    const hasProcessedPreselection = useRef(false);

    const receivedReviews = receivedData?.data || [];
    const writtenReviews = writtenData?.data || [];
    const assignments = assignmentsData?.data || [];

    // Get completed assignments that haven't been reviewed yet
    const completedAssignments = assignments.filter((a) => a.status === "COMPLETED");
    const reviewedAssignmentIds = new Set(writtenReviews.map((r) => r.missionAssignmentId));
    const unreviewedAssignments = completedAssignments.filter(
        (a) => !reviewedAssignmentIds.has(a.id)
    );

    // Calculate average rating received
    const averageRating =
        receivedReviews.length > 0
            ? (receivedReviews.reduce((sum, r) => sum + r.rating, 0) / receivedReviews.length).toFixed(1)
            : "N/A";

    const handleOpenReviewForm = (assignment: MissionAssignment) => {
        setSelectedAssignment(assignment);
        setShowReviewForm(true);
    };

    const handleCloseReviewForm = () => {
        setSelectedAssignment(null);
        setShowReviewForm(false);
    };

    // Auto-open form if assignmentId is in URL (only once)
    // Using useLayoutEffect to run synchronously before paint
    useLayoutEffect(() => {
        if (
            preselectedAssignmentId &&
            unreviewedAssignments.length > 0 &&
            !hasProcessedPreselection.current &&
            !assignmentsLoading &&
            !isLoading
        ) {
            const assignment = unreviewedAssignments.find(
                (a) => a.id === parseInt(preselectedAssignmentId)
            );
            if (assignment) {
                hasProcessedPreselection.current = true;
                setSelectedAssignment(assignment);
                setShowReviewForm(true);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [preselectedAssignmentId, assignmentsLoading, isLoading, unreviewedAssignments.length]);

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Average Rating</p>
                                <p className="text-2xl font-bold">{averageRating}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-warning/10">
                                <Star className="h-5 w-5 text-warning fill-warning" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Reviews Received</p>
                                <p className="text-2xl font-bold">{receivedReviews.length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-info/10">
                                <MessageSquare className="h-5 w-5 text-info" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Reviews Written</p>
                                <p className="text-2xl font-bold">{writtenReviews.length}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-success/10">
                                <Send className="h-5 w-5 text-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Reviews */}
            {unreviewedAssignments.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Pending Reviews</CardTitle>
                        <CardDescription>
                            Leave a review for completed missions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {unreviewedAssignments.map((assignment) => (
                                <div
                                    key={assignment.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div>
                                        <p className="font-medium">
                                            {assignment.mission?.title || "Mission"}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {assignment.institution?.institutionName || "Institution"}
                                        </p>
                                    </div>
                                    <Button
                                        size="sm"
                                        onClick={() => handleOpenReviewForm(assignment)}
                                    >
                                        <Star className="mr-2 h-4 w-4" />
                                        Review
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Reviews Tabs */}
            <Tabs defaultValue="received" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="received">
                        Received ({receivedReviews.length})
                    </TabsTrigger>
                    <TabsTrigger value="written">
                        Written ({writtenReviews.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="received" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-4 space-y-3">
                                        <Skeleton className="h-6 w-1/3" />
                                        <Skeleton className="h-4 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : receivedReviews.length === 0 ? (
                        <EmptyState
                            icon={Star}
                            title="No reviews received yet"
                            description="Complete missions to receive reviews from institutions."
                        />
                    ) : (
                        <div className="space-y-4">
                            {receivedReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} type="received" />
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="written" className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i}>
                                    <CardContent className="p-4 space-y-3">
                                        <Skeleton className="h-6 w-1/3" />
                                        <Skeleton className="h-4 w-full" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : writtenReviews.length === 0 ? (
                        <EmptyState
                            icon={Send}
                            title="No reviews written yet"
                            description="Leave reviews for institutions after completing missions."
                        />
                    ) : (
                        <div className="space-y-4">
                            {writtenReviews.map((review) => (
                                <ReviewCard key={review.id} review={review} type="written" />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Review Form Dialog */}
            <Dialog open={showReviewForm} onOpenChange={handleCloseReviewForm}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Write a Review</DialogTitle>
                        <DialogDescription>
                            Share your experience working with this institution
                        </DialogDescription>
                    </DialogHeader>
                    {selectedAssignment && (
                        <ReviewForm
                            assignment={selectedAssignment}
                            onSuccess={handleCloseReviewForm}
                            onCancel={handleCloseReviewForm}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}

