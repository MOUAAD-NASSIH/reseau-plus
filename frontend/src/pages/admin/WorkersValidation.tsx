import { useState, useMemo, useCallback } from "react";
import { format } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import {
    Users,
    Eye,
    CheckCircle,
    XCircle,
    FileText,
    MapPin,
    Calendar,
    Briefcase,
    Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    useGetPendingWorkersQuery,
    useValidateWorkerMutation,
    useRejectWorkerMutation,
    useReviewDocumentMutation,
} from "@/features/api/endpoints/adminEndpoints";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { Worker, WorkerDocument } from "@/types/auth.types";

interface WorkerDetailsDialogProps {
    worker: Worker | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (workerId: number) => void;
    onReject: (workerId: number, reason: string) => void;
    onApproveDocument: (documentId: number) => void;
    onRejectDocument: (documentId: number, comment: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
    isApprovingDocument: boolean;
    isRejectingDocument: boolean;
    processingDocumentId: number | null;
}

function WorkerDetailsDialog({
    worker,
    open,
    onOpenChange,
    onApprove,
    onReject,
    onApproveDocument,
    onRejectDocument,
    isApproving,
    isRejecting,
    isApprovingDocument,
    isRejectingDocument,
    processingDocumentId,
}: WorkerDetailsDialogProps) {
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);
    const [documentRejectComment, setDocumentRejectComment] = useState("");
    const [rejectingDocumentId, setRejectingDocumentId] = useState<number | null>(null);

    if (!worker) return null;

    const handleReject = () => {
        if (rejectReason.trim()) {
            onReject(worker.id, rejectReason);
            setRejectReason("");
            setShowRejectForm(false);
        }
    };

    const handleClose = () => {
        setShowRejectForm(false);
        setRejectReason("");
        setRejectingDocumentId(null);
        setDocumentRejectComment("");
        onOpenChange(false);
    };

    const handleDocumentReject = (documentId: number) => {
        if (documentRejectComment.trim()) {
            onRejectDocument(documentId, documentRejectComment);
            setDocumentRejectComment("");
            setRejectingDocumentId(null);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Worker Profile: {worker.firstName} {worker.lastName}
                    </DialogTitle>
                    <DialogDescription>
                        Review worker information and documents before validation
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Full Name</Label>
                            <p className="font-medium">
                                {worker.firstName} {worker.lastName}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Status</Label>
                            <div>
                                <StatusBadge status={worker.status} />
                            </div>
                        </div>
                        {worker.speciality && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <Briefcase className="h-3 w-3" />
                                    Speciality
                                </Label>
                                <p className="font-medium">{worker.speciality.name}</p>
                            </div>
                        )}
                        {worker.experienceYears !== null && worker.experienceYears !== undefined && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Experience</Label>
                                <p className="font-medium">{worker.experienceYears} years</p>
                            </div>
                        )}
                        {worker.city && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Location
                                </Label>
                                <p className="font-medium">
                                    {worker.city}
                                    {worker.zipCode && ` (${worker.zipCode})`}
                                </p>
                            </div>
                        )}
                        {worker.birthDate && (
                            <div className="space-y-1">
                                <Label className="text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    Birth Date
                                </Label>
                                <p className="font-medium">
                                    {new Date(worker.birthDate).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Bio */}
                    {worker.bio && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Bio</Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg">{worker.bio}</p>
                        </div>
                    )}

                    {/* Documents */}
                    {worker.documents && worker.documents.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                Documents ({worker.documents.length})
                            </Label>
                            <div className="space-y-2">
                                {worker.documents.map((doc: WorkerDocument) => {
                                    const isProcessing = processingDocumentId === doc.id;
                                    const isRejecting = rejectingDocumentId === doc.id;
                                    const canReview = doc.status === "PENDING";

                                    return (
                                        <div
                                            key={doc.id}
                                            className="p-3 bg-muted/50 rounded-lg space-y-2"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                    <div>
                                                        <p className="font-medium text-sm">{doc.type}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <StatusBadge status={doc.status} />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => window.open(doc.fileUrl, "_blank")}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Document action buttons */}
                                            {canReview && !isRejecting && (
                                                <div className="flex items-center gap-2 pt-2 border-t">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => onApproveDocument(doc.id)}
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing && isApprovingDocument ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                        ) : (
                                                            <CheckCircle className="h-4 w-4 mr-1 text-success" />
                                                        )}
                                                        Approve
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1"
                                                        onClick={() => setRejectingDocumentId(doc.id)}
                                                        disabled={isProcessing}
                                                    >
                                                        <XCircle className="h-4 w-4 mr-1 text-destructive" />
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}

                                            {/* Document reject form */}
                                            {isRejecting && (
                                                <div className="space-y-2 pt-2 border-t">
                                                    <Textarea
                                                        placeholder="Reason for rejection..."
                                                        value={documentRejectComment}
                                                        onChange={(e) => setDocumentRejectComment(e.target.value)}
                                                        rows={2}
                                                        className="text-sm"
                                                    />
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => {
                                                                setRejectingDocumentId(null);
                                                                setDocumentRejectComment("");
                                                            }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            onClick={() => handleDocumentReject(doc.id)}
                                                            disabled={!documentRejectComment.trim() || isRejectingDocument}
                                                        >
                                                            {isRejectingDocument ? (
                                                                <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                                            ) : null}
                                                            Confirm Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Experiences */}
                    {worker.experiences && worker.experiences.length > 0 && (
                        <div className="space-y-2">
                            <Label className="text-muted-foreground">
                                Work Experience ({worker.experiences.length})
                            </Label>
                            <div className="space-y-2">
                                {worker.experiences.map((exp) => (
                                    <div
                                        key={exp.id}
                                        className="p-3 bg-muted/50 rounded-lg"
                                    >
                                        <p className="font-medium text-sm">{exp.jobTitle}</p>
                                        <p className="text-sm text-muted-foreground">{exp.organization}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(exp.startDate).toLocaleDateString()} -{" "}
                                            {exp.endDate
                                                ? new Date(exp.endDate).toLocaleDateString()
                                                : "Present"}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Reject Form */}
                    {showRejectForm && (
                        <div className="space-y-2 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                            <Label htmlFor="rejectReason">Rejection Reason</Label>
                            <Textarea
                                id="rejectReason"
                                placeholder="Please provide a reason for rejection..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                rows={3}
                            />
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    {showRejectForm ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowRejectForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || isRejecting}
                            >
                                {isRejecting ? "Rejecting..." : "Confirm Rejection"}
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                variant="outline"
                                onClick={() => setShowRejectForm(true)}
                            >
                                <XCircle className="mr-2 h-4 w-4" />
                                Reject
                            </Button>
                            <Button
                                onClick={() => onApprove(worker.id)}
                                disabled={isApproving}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isApproving ? "Approving..." : "Approve Worker"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function WorkersValidation() {
    const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [processingDocumentId, setProcessingDocumentId] = useState<number | null>(null);

    const { data: pendingWorkersData, isLoading, refetch } = useGetPendingWorkersQuery();
    const [validateWorker, { isLoading: isValidating }] = useValidateWorkerMutation();
    const [rejectWorker, { isLoading: isRejecting }] = useRejectWorkerMutation();
    const [reviewDocument, { isLoading: isReviewingDocument }] = useReviewDocumentMutation();

    const pendingWorkers = pendingWorkersData?.data || [];

    const handleViewWorker = useCallback((worker: Worker) => {
        setSelectedWorker(worker);
        setDialogOpen(true);
    }, []);

    const handleApprove = useCallback((workerId: number) => {
        validateWorker(workerId)
            .unwrap()
            .then(() => {
                setDialogOpen(false);
                setSelectedWorker(null);
            });
    }, [validateWorker]);

    const handleReject = useCallback((workerId: number, reason: string) => {
        rejectWorker({ workerId, reason })
            .unwrap()
            .then(() => {
                setDialogOpen(false);
                setSelectedWorker(null);
            });
    }, [rejectWorker]);

    const handleApproveDocument = useCallback((documentId: number) => {
        setProcessingDocumentId(documentId);
        reviewDocument({ documentId, status: "APPROVED" })
            .unwrap()
            .then(() => {
                showSuccessToast("Document approved", "The document has been approved.");
                setProcessingDocumentId(null);
                // Update the local selectedWorker state to reflect the change
                if (selectedWorker) {
                    setSelectedWorker({
                        ...selectedWorker,
                        documents: selectedWorker.documents?.map((doc) =>
                            doc.id === documentId
                                ? { ...doc, status: "APPROVED" as const }
                                : doc
                        ),
                    });
                }
                // Refetch to update the worker's documents
                refetch();
            })
            .catch((error) => {
                showErrorToast(error, "Failed to approve document.");
                setProcessingDocumentId(null);
            });
    }, [reviewDocument, refetch, selectedWorker]);

    const handleRejectDocument = useCallback((documentId: number, comment: string) => {
        setProcessingDocumentId(documentId);
        reviewDocument({ documentId, status: "REJECTED", comment })
            .unwrap()
            .then(() => {
                showSuccessToast("Document rejected", "The document has been rejected.");
                setProcessingDocumentId(null);
                // Update the local selectedWorker state to reflect the change
                if (selectedWorker) {
                    setSelectedWorker({
                        ...selectedWorker,
                        documents: selectedWorker.documents?.map((doc) =>
                            doc.id === documentId
                                ? { ...doc, status: "REJECTED" as const, adminComment: comment }
                                : doc
                        ),
                    });
                }
                // Refetch to update the worker's documents
                refetch();
            })
            .catch((error) => {
                showErrorToast(error, "Failed to reject document.");
                setProcessingDocumentId(null);
            });
    }, [reviewDocument, refetch, selectedWorker]);

    // Column definitions for DataTable
    const columns: ColumnDef<Worker>[] = useMemo(
        () => [
            {
                accessorKey: "firstName",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Worker" />
                ),
                cell: ({ row }) => {
                    const worker = row.original;
                    return (
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                                <p className="font-medium truncate">
                                    {worker.firstName} {worker.lastName}
                                </p>
                                {worker.speciality && (
                                    <p className="text-xs text-muted-foreground">
                                        {worker.speciality.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    );
                },
                accessorFn: (row) => `${row.firstName} ${row.lastName}`,
            },
            {
                accessorKey: "city",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Location" />
                ),
                cell: ({ row }) => {
                    const city = row.getValue("city") as string | null;
                    return city ? (
                        <div className="flex items-center gap-1 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="truncate max-w-[120px]">{city}</span>
                        </div>
                    ) : (
                        <span className="text-muted-foreground">-</span>
                    );
                },
            },
            {
                accessorKey: "documents",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Documents" />
                ),
                cell: ({ row }) => {
                    const documents = row.original.documents;
                    const count = documents?.length || 0;
                    return (
                        <div className="flex items-center gap-1 text-sm">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span>{count} document{count !== 1 ? "s" : ""}</span>
                        </div>
                    );
                },
                accessorFn: (row) => row.documents?.length || 0,
            },
            {
                accessorKey: "createdAt",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Registered" />
                ),
                cell: ({ row }) => (
                    <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {format(new Date(row.getValue("createdAt")), "MMM d, yyyy")}
                    </div>
                ),
            },
            {
                accessorKey: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
            },
            {
                id: "actions",
                header: "Actions",
                cell: ({ row }) => {
                    const worker = row.original;
                    return (
                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewWorker(worker)}
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                Review
                            </Button>
                        </div>
                    );
                },
                enableSorting: false,
            },
        ],
        [handleViewWorker]
    );

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Pending Worker Validations
                        {!isLoading && (
                            <Badge variant="secondary" className="ml-2">
                                {pendingWorkers.length}
                            </Badge>
                        )}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={columns}
                        data={pendingWorkers}
                        isLoading={isLoading}
                        enableSorting={true}
                        enableGlobalFilter={true}
                        globalFilterPlaceholder="Search workers..."
                        enablePagination={true}
                        pageSize={10}
                        emptyIcon={Users}
                        emptyTitle="No pending validations"
                        emptyDescription="All workers have been validated. Check back later for new registrations."
                    />
                </CardContent>
            </Card>

            <WorkerDetailsDialog
                worker={selectedWorker}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                onApproveDocument={handleApproveDocument}
                onRejectDocument={handleRejectDocument}
                isApproving={isValidating}
                isRejecting={isRejecting}
                isApprovingDocument={isReviewingDocument && processingDocumentId !== null}
                isRejectingDocument={isReviewingDocument && processingDocumentId !== null}
                processingDocumentId={processingDocumentId}
            />
        </div>
    );
}

