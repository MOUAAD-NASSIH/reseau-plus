import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Star,
    Filter,
    Calendar,
    User as UserIcon,
    Eye,
    X,
    MessageSquare,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAllReviews } from "@/features/hooks/useReviews";
import type { Review } from "@/types/review.types";
import type { User } from "@/types/auth.types";

// Helper to get display name from user
function getUserDisplayName(user?: User): string {
    if (!user) return "Unknown";
    return user.email.split("@")[0]; // Use email prefix as display name
}

// Helper to get role name
function getRoleName(user?: User): string {
    if (!user?.role) return "Unknown";
    return user.role.name || "Unknown";
}

// Star rating display component
function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`h-4 w-4 ${star <= rating
                        ? "fill-warning text-warning"
                        : "text-muted-foreground"
                        }`}
                />
            ))}
            <span className="ml-1 text-sm font-medium">{rating}/5</span>
        </div>
    );
}

interface ReviewDetailsDialogProps {
    review: Review | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

function ReviewDetailsDialog({ review, open, onOpenChange }: ReviewDetailsDialogProps) {
    if (!review) return null;

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("fr-FR", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Review Details
                    </DialogTitle>
                    <DialogDescription>
                        Review #{review.id} information
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Rating */}
                    <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                            <StarRating rating={review.rating} />
                        </div>
                    </div>

                    {/* Reviewer Info */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            Reviewer
                        </Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium">
                                {getUserDisplayName(review.reviewer)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {review.reviewer?.email}
                            </p>
                            <Badge variant="outline" className="mt-1">
                                {getRoleName(review.reviewer)}
                            </Badge>
                        </div>
                    </div>

                    {/* Reviewee Info */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            Reviewee
                        </Label>
                        <div className="bg-muted/50 p-3 rounded-lg">
                            <p className="font-medium">
                                {getUserDisplayName(review.reviewee)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {review.reviewee?.email}
                            </p>
                            <Badge variant="outline" className="mt-1">
                                {getRoleName(review.reviewee)}
                            </Badge>
                        </div>
                    </div>

                    {/* Comment */}
                    {review.comment && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                Comment
                            </Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg whitespace-pre-wrap">
                                {review.comment}
                            </p>
                        </div>
                    )}

                    {/* Date */}
                    <div className="space-y-1">
                        <Label className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Created At
                        </Label>
                        <p className="font-medium">{formatDate(review.createdAt)}</p>
                    </div>

                    {/* Metadata */}
                    <div className="text-xs text-muted-foreground border-t pt-4">
                        <p>Review ID: {review.id}</p>
                        <p>Assignment ID: {review.missionAssignmentId}</p>
                        <p>Reviewer ID: {review.reviewerId}</p>
                        <p>Reviewee ID: {review.revieweeId}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function ReviewsOverview() {
    const [ratingFilter, setRatingFilter] = useState<string>("ALL");
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Fetch data
    const { data: reviewsData, isLoading: reviewsLoading } = useAllReviews(
        ratingFilter !== "ALL" ? { minRating: parseInt(ratingFilter), maxRating: parseInt(ratingFilter) } : undefined
    );

    const reviews = reviewsData?.data || [];

    // Calculate stats
    const stats = useMemo(() => {
        if (reviews.length === 0) return { average: 0, total: 0 };
        const total = reviews.length;
        const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
        return {
            average: sum / total,
            total,
        };
    }, [reviews]);

    const handleViewReview = useCallback((review: Review) => {
        setSelectedReview(review);
        setDialogOpen(true);
    }, []);

    // Column definitions for DataTable
    const columns: ColumnDef<Review>[] = useMemo(
        () => [
            {
                accessorKey: "reviewer.email",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Reviewer" />
                ),
                cell: ({ row }) => {
                    const review = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="font-medium truncate max-w-[120px]">
                                    {getUserDisplayName(review.reviewer)}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    {getRoleName(review.reviewer)}
                                </Badge>
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => row.reviewer?.email || "",
            },
            {
                accessorKey: "reviewee.email",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Reviewee" />
                ),
                cell: ({ row }) => {
                    const review = row.original;
                    return (
                        <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-muted-foreground" />
                            <div className="min-w-0">
                                <p className="font-medium truncate max-w-[120px]">
                                    {getUserDisplayName(review.reviewee)}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                    {getRoleName(review.reviewee)}
                                </Badge>
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => row.reviewee?.email || "",
            },
            {
                accessorKey: "rating",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Rating" />
                ),
                cell: ({ row }) => <StarRating rating={row.getValue("rating")} />,
            },
            {
                accessorKey: "comment",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Comment" />
                ),
                cell: ({ row }) => (
                    <p className="truncate max-w-[200px] text-sm text-muted-foreground">
                        {row.getValue("comment") || "-"}
                    </p>
                ),
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Date" />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const review = row.original;
                    return (
                        <div className="flex justify-end">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewReview(review)}
                            >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleViewReview]
    );

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Reviews
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-info" />
                            <span className="text-2xl font-bold">{stats.total}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Average Rating
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4 fill-warning text-warning" />
                            <span className="text-2xl font-bold">
                                {stats.average.toFixed(1)}
                            </span>
                            <span className="text-muted-foreground">/ 5</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Filter className="h-5 w-5" />
                        Filters
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Rating Filter */}
                        <div className="space-y-2 w-full md:w-64">
                            <label className="text-sm font-medium">Rating</label>
                            <Select
                                value={ratingFilter}
                                onValueChange={setRatingFilter}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Rating" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">All Ratings</SelectItem>
                                    <SelectItem value="5">5 Stars</SelectItem>
                                    <SelectItem value="4">4 Stars</SelectItem>
                                    <SelectItem value="3">3 Stars</SelectItem>
                                    <SelectItem value="2">2 Stars</SelectItem>
                                    <SelectItem value="1">1 Star</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Clear Filters */}
                        {ratingFilter !== "ALL" && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setRatingFilter("ALL")}
                                className="text-muted-foreground mt-6"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear filter
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Reviews Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        All Reviews
                        {!reviewsLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {reviews.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={reviews}
                        isLoading={reviewsLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search by reviewer, reviewee, or comment..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Star}
                        emptyTitle="No reviews found"
                        emptyDescription={
                            ratingFilter !== "ALL"
                                ? "No reviews match the current filters. Try adjusting your search criteria."
                                : "There are no reviews in the system yet."
                        }
                        emptyAction={
                            ratingFilter !== "ALL" ? (
                                <Button variant="outline" onClick={() => setRatingFilter("ALL")}>
                                    Clear filter
                                </Button>
                            ) : undefined
                        }
                    />
                </CardContent>
            </Card>

            {/* Review Details Dialog */}
            <ReviewDetailsDialog
                review={selectedReview}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
            />
        </div>
    );
}
