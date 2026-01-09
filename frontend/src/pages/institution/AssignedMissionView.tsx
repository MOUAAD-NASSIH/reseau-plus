import { useParams, Link, useNavigate } from "react-router";
import {
    ArrowLeft,
    User,
    Calendar,
    MapPin,
    CreditCard,
    Briefcase,
    Clock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useGetAssignmentQuery, useUpdateAssignmentStatusMutation } from "@/features/api/endpoints/assignmentEndpoints";
import { useGetPaymentsQuery } from "@/features/api/endpoints/paymentEndpoints";
import type { AssignmentStatus } from "@/types/assignment.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export default function AssignedMissionView() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const assignmentId = parseInt(id || "0");

    const { data: assignmentData, isLoading: assignmentLoading } = useGetAssignmentQuery(assignmentId);
    const { data: paymentsData, isLoading: paymentsLoading } = useGetPaymentsQuery({
        missionAssignmentId: assignmentId,
    });
    const [updateStatus, { isLoading: isUpdating }] = useUpdateAssignmentStatusMutation();

    const assignment = assignmentData?.data;
    const payments = paymentsData?.data || [];
    const payment = payments[0]; // Get the first payment for this assignment

    const handleStatusChange = async (newStatus: AssignmentStatus) => {
        try {
            await updateStatus({ id: assignmentId, status: newStatus }).unwrap();
            showSuccessToast("Status updated", "The assignment status has been updated.");
        } catch (error) {
            showErrorToast(error, "Failed to update status. Please try again.");
        }
    };

    const handlePayment = () => {
        navigate(`/institution/payments/${assignmentId}`);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString();
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("fr-MA", {
            style: "currency",
            currency: "MAD",
        }).format(amount);
    };

    if (assignmentLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-6 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <Skeleton key={i} className="h-6 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!assignment) {
        return (
            <Card>
                <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">Assignment not found</p>
                    <Button
                        variant="outline"
                        className="mt-4"
                        asChild
                    >
                        <Link to="/institution/missions">Back to Missions</Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const canPay = assignment.status === "COMPLETED" && (!payment || payment.status !== "COMPLETED");
    const isPaid = payment?.status === "COMPLETED";

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild aria-label="Go back to missions">
                    <Link to="/institution/missions">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <h1 className="text-xl font-semibold">
                        {assignment.mission?.title || "Assignment"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <StatusBadge status={assignment.status} />
                        {isPaid && <Badge variant="success">Paid</Badge>}
                    </div>
                </div>
                {canPay && (
                    <Button onClick={handlePayment}>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Process Payment
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Mission Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Briefcase className="h-5 w-5" />
                            Mission Details
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Title</p>
                            <p>{assignment.mission?.title}</p>
                        </div>
                        {assignment.mission?.description && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Description</p>
                                <p className="text-sm">{assignment.mission.description}</p>
                            </div>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Start Date</p>
                                <p className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {assignment.mission?.startDate
                                        ? formatDate(assignment.mission.startDate)
                                        : "-"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">End Date</p>
                                <p className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    {assignment.mission?.endDate
                                        ? formatDate(assignment.mission.endDate)
                                        : "-"}
                                </p>
                            </div>
                        </div>
                        {assignment.mission?.location && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {assignment.mission.location}
                                </p>
                            </div>
                        )}
                        {assignment.mission?.budget && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Budget</p>
                                <p className="font-semibold">
                                    {formatCurrency(assignment.mission.budget)}
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Worker Details */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Assigned Worker
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <User className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">
                                    {assignment.worker?.firstName} {assignment.worker?.lastName}
                                </p>
                                {assignment.worker?.speciality && (
                                    <p className="text-sm text-muted-foreground">
                                        {assignment.worker.speciality.name}
                                    </p>
                                )}
                            </div>
                        </div>
                        {assignment.worker?.city && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Location</p>
                                <p className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-muted-foreground" />
                                    {assignment.worker.city}
                                </p>
                            </div>
                        )}
                        {assignment.worker?.experienceYears && (
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Experience</p>
                                <p>{assignment.worker.experienceYears} years</p>
                            </div>
                        )}
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Assigned On</p>
                            <p className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                {formatDate(assignment.assignedAt)}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Assignment Status */}
                <Card>
                    <CardHeader>
                        <CardTitle>Assignment Status</CardTitle>
                        <CardDescription>
                            Update the status of this assignment
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground mb-2">
                                    Current Status
                                </p>
                                <Select
                                    value={assignment.status}
                                    onValueChange={(value) => handleStatusChange(value as AssignmentStatus)}
                                    disabled={isUpdating}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                        <SelectItem value="ONGOING">Ongoing</SelectItem>
                                        <SelectItem value="COMPLETED">Completed</SelectItem>
                                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Mark the assignment as "Completed" when the mission is finished to enable payment.
                        </p>
                    </CardContent>
                </Card>

                {/* Payment Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            Payment Status
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {paymentsLoading ? (
                            <Skeleton className="h-20 w-full" />
                        ) : payment ? (
                            <>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Status</span>
                                    <StatusBadge status={payment.status} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Total Amount</span>
                                    <span className="font-semibold">
                                        {formatCurrency(payment.amountTotal)}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Worker Amount</span>
                                    <span>{formatCurrency(payment.workerAmount)}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">Platform Fee</span>
                                    <span>{formatCurrency(payment.platformFee)}</span>
                                </div>
                                {payment.paidAt && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">Paid On</span>
                                        <span>{formatDate(payment.paidAt)}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-muted-foreground mb-4">
                                    {assignment.status === "COMPLETED"
                                        ? "No payment has been made yet."
                                        : "Complete the assignment to enable payment."}
                                </p>
                                {canPay && (
                                    <Button onClick={handlePayment}>
                                        <CreditCard className="h-4 w-4 mr-2" />
                                        Process Payment
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

