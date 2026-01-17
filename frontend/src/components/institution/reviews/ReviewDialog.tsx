import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarRating } from "@/components/common/StarRating";
import { createReviewSchema, type CreateReviewInput } from "@/features/validation/reviewSchemas";
import type { MissionAssignment } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

interface ReviewDialogProps {
    isOpen: boolean;
    onClose: () => void;
    assignment: MissionAssignment | null;
    onSubmit: (data: CreateReviewInput) => Promise<any>;
    isSubmitting: boolean;
}

export function ReviewDialog({
    isOpen,
    onClose,
    assignment,
    onSubmit,
    isSubmitting,
}: ReviewDialogProps) {
    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: { errors },
    } = useForm<CreateReviewInput>({
        resolver: zodResolver(createReviewSchema),
        defaultValues: {
            rating: 0,
            comment: "",
            missionAssignmentId: assignment?.id || 0,
        },
    });

    const rating = watch("rating");

    const handleFormSubmit = async (data: CreateReviewInput) => {
        if (!assignment) return;
        try {
            await onSubmit({ ...data, missionAssignmentId: assignment.id });
            showSuccessToast("Review submitted", "Your review has been successfully posted.");
            reset();
            onClose();
        } catch (error) {
            showErrorToast(error, "Failed to submit review");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Rate Social Worker</DialogTitle>
                    <DialogDescription>
                        How was your experience working with {assignment?.worker?.firstName} {assignment?.worker?.lastName}?
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 pt-4">
                    <div className="space-y-3">
                        <Label className="text-base">Overall Rating</Label>
                        <div className="flex justify-center p-4 bg-muted/30 rounded-xl">
                            <StarRating
                                value={rating}
                                onChange={(val) => setValue("rating", val, { shouldValidate: true })}
                            />
                        </div>
                        {errors.rating && (
                            <p className="text-xs text-destructive text-center">{errors.rating.message}</p>
                        )}
                    </div>

                    <div className="space-y-3">
                        <Label htmlFor="comment" className="text-base">Write a Comment</Label>
                        <Textarea
                            id="comment"
                            placeholder="Tell us more about the worker's performance, professionalism, etc..."
                            className="min-h-[120px] resize-none bg-muted/30 border-none focus-visible:ring-primary/20"
                            {...register("comment")}
                        />
                        {errors.comment && (
                            <p className="text-xs text-destructive">{errors.comment.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || rating === 0} className="px-8">
                            {isSubmitting ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                            ) : (
                                <><Send className="mr-2 h-4 w-4" /> Submit Review</>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
