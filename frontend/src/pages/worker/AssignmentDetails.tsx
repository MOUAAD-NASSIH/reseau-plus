import { useState, useMemo } from "react";
import { useParams, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, differenceInDays } from "date-fns";
import {
    MapPin,
    Calendar,
    Briefcase,
    Building2,
    DollarSign,
    Clock,
    Phone,
    FileText,
    HelpCircle,
    Star,
    CheckCircle2,
    RotateCcw,
    Send,
    Loader2,
    User,
    TrendingUp,
    ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useGetAssignmentQuery } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetMissionQuery } from "@/features/api/endpoints/missionEndpoints";
import { useGetMyWrittenReviewsQuery, useCreateReviewMutation, useGetMyReceivedReviewsQuery } from "@/features/api/endpoints/reviewEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import { cn } from "@/lib/utils";
import { showInfoToast, showSuccessToast, showErrorToast } from "@/lib/toast";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { MissionAssignment } from "@/types/assignment.types";

// --- Components ---

interface StarRatingProps {
    value: number;
    onChange?: (value: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

function StarRating({ value, onChange, readonly = false, size = "md" }: StarRatingProps) {
    const [hoverValue, setHoverValue] = useState(0);
    const sizeClasses = {
        sm: "h-3.5 w-3.5",
        md: "h-5 w-5",
        lg: "h-6 w-6",
        xl: "h-8 w-8"
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
                        "transition-all duration-200 focus:outline-hidden",
                        readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
                    )}
                >
                    <Star
                        className={cn(
                            sizeClasses[size],
                            "transition-colors",
                            (hoverValue || value) >= star
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground/30"
                        )}
                    />
                </button>
            ))}
        </div>
    );
}

function ReviewForm({ assignment, onSuccess }: { assignment: MissionAssignment; onSuccess: () => void }) {
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
        <Card className="border-primary/20 bg-primary/5 shadow-md overflow-hidden">
            <CardHeader className="bg-primary/10 pb-4">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <Star className="h-5 w-5 fill-primary" />
                    How was your experience?
                </CardTitle>
                <CardDescription>
                    Rate your collaboration with {assignment.institution?.institutionName}. This feedback is valuable for the community.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-3 text-center">
                        <Label className="text-base font-medium">Click to rate</Label>
                        <div className="flex justify-center">
                            <StarRating value={rating} onChange={handleRatingChange} size="xl" />
                        </div>
                        {errors.rating && (
                            <p className="text-sm text-destructive font-medium">{errors.rating.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Your Feedback <span className="text-muted-foreground font-normal">(Optional)</span></Label>
                        <Textarea
                            id="comment"
                            {...register("comment")}
                            placeholder="Share details about the work environment, communication, etc..."
                            className="min-h-[100px] resize-none focus-visible:ring-primary bg-background"
                        />
                        {errors.comment && (
                            <p className="text-sm text-destructive">{errors.comment.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="submit"
                            disabled={isCreating || rating === 0}
                            className="rounded-full px-8 shadow-lg shadow-primary/20 w-full sm:w-auto"
                        >
                            {isCreating ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> Submit Review</>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

// --- Helper Functions ---

function getStatusConfig(status: string) {
    switch (status) {
        case "ACTIVE":
            return { color: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30", icon: TrendingUp, label: "Active" };
        case "ONGOING":
            return { color: "bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30", icon: Clock, label: "In Progress" };
        case "COMPLETED":
            return { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", icon: CheckCircle2, label: "Completed" };
        case "CANCELLED":
            return { color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30", icon: RotateCcw, label: "Cancelled" };
        default:
            return { color: "bg-muted text-muted-foreground border-border", icon: Briefcase, label: status };
    }
}

function getUrgencyConfig(urgency: string) {
    switch (urgency) {
        case "HIGH":
            return { color: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30", label: "Urgent" };
        case "MEDIUM":
            return { color: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30", label: "Medium Priority" };
        case "LOW":
            return { color: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30", label: "Standard" };
        default:
            return { color: "bg-muted text-muted-foreground border-border", label: urgency };
    }
}

const handleSupport = () => {
    showInfoToast("Coming Soon", "Support ticket feature will be available soon!");
};

const handleCall = () => {
    showInfoToast("Coming Soon", "Call feature will be available soon!");
};

const handleGetDirections = () => {
    showInfoToast("Coming Soon", "Map directions feature will be available soon!");
};

const handleViewMap = () => {
    showInfoToast("Coming Soon", "Map view feature will be available soon!");
};

// --- Main Component ---

export default function AssignmentDetails() {
    const { id } = useParams<{ id: string }>();
    const assignmentId = Number(id);

    const { data: assignmentData, isLoading: assignmentLoading } = useGetAssignmentQuery(assignmentId);

    // Fetch full mission details to ensure we get domains
    const missionId = assignmentData?.data?.missionId;
    const { data: fullMissionData, isLoading: missionLoading } = useGetMissionQuery(
        missionId!,
        { skip: !missionId }
    );

    const { data: writtenReviewsData } = useGetMyWrittenReviewsQuery();
    const { data: receivedReviewsData } = useGetMyReceivedReviewsQuery();
    const { data: paymentsData } = useGetPaymentsQuery();

    const assignment = assignmentData?.data;
    const mission = fullMissionData?.data || assignment?.mission;
    const institution = assignment?.institution;

    // Derived States
    const isReviewed = useMemo(() =>
        writtenReviewsData?.data?.some(r => r.missionAssignmentId === assignmentId),
        [writtenReviewsData, assignmentId]);

    const isPaid = useMemo(() =>
        paymentsData?.data?.some(p => p.missionAssignmentId === assignmentId && p.status === 'COMPLETED'),
        [paymentsData, assignmentId]);

    const writtenReview = useMemo(() =>
        writtenReviewsData?.data?.find(r => r.missionAssignmentId === assignmentId),
        [writtenReviewsData, assignmentId]);

    const receivedReview = useMemo(() =>
        receivedReviewsData?.data?.find(r => r.missionAssignmentId === assignmentId),
        [receivedReviewsData, assignmentId]);

    const isLoading = assignmentLoading || (!!missionId && missionLoading);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-4 md:p-8 space-y-8">
                <div className="space-y-4">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-96" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-32 w-full rounded-2xl" />
                    </div>
                    <div>
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (!assignment || !mission) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto">
                        <Briefcase className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h2 className="text-xl font-bold">Assignment Not Found</h2>
                    <p className="text-muted-foreground max-w-md">We couldn't locate the assignment you're looking for. It may have been removed or you don't have access.</p>
                    <Button asChild variant="outline" className="rounded-full">
                        <Link to="/worker/assignments">Back to Assignments</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const statusConfig = getStatusConfig(assignment.status);
    const urgencyConfig = getUrgencyConfig(mission.urgency);
    const StatusIcon = statusConfig.icon;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-MA', {
            style: 'decimal',
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Header Section */}
            <div className="bg-card/40 border-b border-border pb-8">
                <div className="container mx-auto">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-8">
                        <Link to="/worker" className="text-muted-foreground hover:text-primary transition-colors">
                            Dashboard
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <Link to="/worker/assignments" className="text-muted-foreground hover:text-primary transition-colors">
                            Assignments
                        </Link>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium truncate">
                            Assignment#{assignment.id}
                        </span>
                    </div>

                    <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                        <div className="flex-1 space-y-6">
                            {/* Badges - Top (Status & Urgency) */}
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-semibold gap-1.5 border", statusConfig.color)}>
                                    <StatusIcon className="h-3.5 w-3.5" />
                                    {statusConfig.label}
                                </Badge>
                                <Badge variant="outline" className={cn("px-2.5 py-1 text-xs font-semibold border", urgencyConfig.color)}>
                                    {urgencyConfig.label}
                                </Badge>
                            </div>

                            {/* Title & Organization */}
                            <div>
                                <h1 className="text-3xl md:text-4xl font-black font-spline tracking-tight text-foreground mb-4 leading-tight">
                                    {mission.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-white dark:bg-muted border border-border shadow-xs flex items-center justify-center p-2">
                                        {institution?.logo ? (
                                            <img src={institution.logo} alt="" className="w-full h-full object-contain" />
                                        ) : (
                                            <Building2 className="h-6 w-6 text-muted-foreground/40" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-foreground">{institution?.institutionName}</p>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                            {mission.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {mission.location}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Badges - Bottom (Reviewed & Paid) */}
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                {isReviewed && (
                                    <Badge variant="outline" className="px-3 py-1 text-xs font-bold gap-1.5 border border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-900/50 dark:bg-purple-900/20 dark:text-purple-400">
                                        <Star className="h-3.5 w-3.5 fill-current" />
                                        Review Submitted
                                    </Badge>
                                )}
                                {isPaid && (
                                    <Badge variant="outline" className="px-3 py-1 text-xs font-bold gap-1.5 border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-400">
                                        <DollarSign className="h-3.5 w-3.5" />
                                        Payment Received
                                    </Badge>
                                )}
                            </div>
                        </div>

                        {/* Actions -- Floating/Sidebar */}
                        <div className="flex flex-col gap-3 lg:min-w-[200px] lg:pt-8">
                            <Button size="lg" className="w-full rounded-full shadow-lg shadow-primary/20 font-bold" onClick={handleSupport}>
                                <HelpCircle className="h-4 w-4 mr-2" />
                                Get Support
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Details & Review */}
                    <div className="lg:col-span-2 space-y-8" id="review">

                        {/* Review Section (Conditional) */}
                        {assignment.status === "COMPLETED" && (
                            <div className="animate-in fade-in slide-in-from-top-4 duration-500 space-y-4">
                                {/* Received Review (Institution Feedback) */}
                                {receivedReview && (
                                    <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-900/10">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <div className="size-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                                <Building2 className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-bold font-spline text-lg text-blue-900 dark:text-blue-100">
                                                    Institution Feedback
                                                </h3>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <StarRating value={receivedReview.rating} readonly size="sm" />
                                                    <span className="text-sm font-bold ml-2 text-blue-700 dark:text-blue-300">
                                                        {receivedReview.rating}/5
                                                    </span>
                                                </div>
                                                {receivedReview.comment && (
                                                    <p className="text-blue-800/80 dark:text-blue-300/80 italic">
                                                        "{receivedReview.comment}"
                                                    </p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {/* Worker Review (Your Feedback) */}
                                {!isReviewed ? (
                                    <ReviewForm assignment={assignment} onSuccess={() => { }} />
                                ) : (
                                    <Card className="border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-900/10">
                                        <CardContent className="p-6 flex items-start gap-4">
                                            <div className="size-10 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center shrink-0 text-purple-600 dark:text-purple-400">
                                                <User className="h-5 w-5" />
                                            </div>
                                            <div className="space-y-2">
                                                <h3 className="font-bold font-spline text-lg text-purple-900 dark:text-purple-100"> Your Review</h3>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <StarRating value={writtenReview?.rating || 0} readonly size="sm" />
                                                    <span className="text-sm font-bold ml-2 text-purple-700 dark:text-purple-300">{writtenReview?.rating}/5</span>
                                                </div>
                                                {writtenReview?.comment && (
                                                    <p className="text-purple-800/80 dark:text-purple-300/80 italic">"{writtenReview.comment}"</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* Mission Overview (Description) */}
                        <Card className="border-border shadow-xs overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-background border border-border/60 shadow-xs text-primary">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold font-spline">Mission Overview</CardTitle>
                                        <CardDescription>Details and context about this assignment</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                    {mission.description || "No description provided for this mission."}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Requirements & Domains */}
                        <Card className="border-border shadow-xs overflow-hidden">
                            <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-background border border-border/60 shadow-xs text-primary">
                                        <Briefcase className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-bold font-spline">Requirements & Scope</CardTitle>
                                        <CardDescription>Skills and expertise required</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6 space-y-6">
                                {/* Speciality */}
                                <div>
                                    <h4 className="text-sm font-bold font-spline uppercase tracking-wider text-muted-foreground mb-3">Primary Speciality</h4>
                                    <Badge variant="outline" className="px-3 py-1 bg-background">
                                        {mission.requiredSpeciality?.name || "General Social Work"}
                                    </Badge>
                                </div>

                                <Separator />

                                {/* Domains */}
                                <div>
                                    <h4 className="text-sm font-bold font-spline uppercase tracking-wider text-muted-foreground mb-3">Intervention Domains</h4>
                                    {mission.domains && mission.domains.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {mission.domains.map((md) => (
                                                <Badge key={md.id} variant="outline" className="px-3 py-1 bg-background">
                                                    {md.domain?.name}
                                                </Badge>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">No specific domains listed</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Key Details Sidebar */}
                    <div className="space-y-6">
                        <Card className="border-border shadow-sm overflow-hidden h-fit sticky top-24">
                            <div className="h-2 bg-primary w-full" />
                            <CardContent className="p-0">
                                <div className="grid divide-y divide-border/60">

                                    {/* Budget */}
                                    <div className="p-5 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                                        <div className="p-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-muted-foreground mb-0.5">Total Budget</p>
                                            <p className="text-2xl font-black text-foreground tabular-nums tracking-tight">
                                                {formatCurrency(mission.budget || 0)} <span className="text-sm font-bold text-muted-foreground">MAD</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="p-5 flex items-start gap-4 hover:bg-muted/5 transition-colors">
                                        <div className="p-2 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5">
                                            <Calendar className="h-5 w-5" />
                                        </div>
                                        <div className="space-y-4 w-full">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">Start Date</p>
                                                <p className="font-semibold">{format(new Date(mission.startDate), "MMMM d, yyyy")}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">End Date</p>
                                                <p className="font-semibold">{format(new Date(mission.endDate), "MMMM d, yyyy")}</p>
                                            </div>
                                            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                                                <span className="text-xs font-medium text-muted-foreground">Duration</span>
                                                <Badge variant="secondary" className="text-xs font-bold">
                                                    {differenceInDays(new Date(mission.endDate), new Date(mission.startDate))} days
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Location */}
                                    {institution?.address && (
                                        <div className="p-5 space-y-4 hover:bg-muted/5 transition-colors">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                                                    <MapPin className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-muted-foreground mb-1">Address</p>
                                                    <p className="text-sm font-semibold leading-relaxed">{institution.address}</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <Button variant="outline" size="sm" className="w-full rounded-full text-xs" onClick={handleViewMap}>
                                                    View Map
                                                </Button>
                                                <Button variant="outline" size="sm" className="w-full rounded-full text-xs" onClick={handleGetDirections}>
                                                    Directions
                                                </Button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contact */}
                                    <div className="p-5 flex items-center justify-between gap-4 hover:bg-muted/5 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="size-10 rounded-full bg-muted flex items-center justify-center border border-border">
                                                <User className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold">Institution Contact</p>
                                                <p className="text-xs text-muted-foreground">Manager</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10" onClick={handleCall}>
                                            <Phone className="h-4 w-4" />
                                        </Button>
                                    </div>

                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </div>
            </div>
        </div>
    );
}
