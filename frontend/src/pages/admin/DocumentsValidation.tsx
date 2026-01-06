import { useState } from "react";
import {
    FileText,
    Eye,
    CheckCircle,
    XCircle,
    User,
    Calendar,
    Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
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
    useGetPendingDocumentsQuery,
    useReviewDocumentMutation,
} from "@/features/api/endpoints/adminEndpoints";
import type { WorkerDocument } from "@/types/auth.types";

interface DocumentReviewDialogProps {
    document: WorkerDocument | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApprove: (documentId: number) => void;
    onReject: (documentId: number, comment: string) => void;
    isApproving: boolean;
    isRejecting: boolean;
}

function DocumentReviewDialog({
    document,
    open,
    onOpenChange,
    onApprove,
    onReject,
    isApproving,
    isRejecting,
}: DocumentReviewDialogProps) {
    const [rejectComment, setRejectComment] = useState("");
    const [showRejectForm, setShowRejectForm] = useState(false);

    if (!document) return null;

    const handleReject = () => {
        if (rejectComment.trim()) {
            onReject(document.id, rejectComment);
            setRejectComment("");
            setShowRejectForm(false);
        }
    };

    const handleClose = () => {
        setShowRejectForm(false);
        setRejectComment("");
        onOpenChange(false);
    };

    const getDocumentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            DIPLOMA: "Diploma",
            CV: "Curriculum Vitae",
            ID: "Identity Document",
            OTHER: "Other Document",
        };
        return labels[type] || type;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Document Review: {getDocumentTypeLabel(document.type)}
                    </DialogTitle>
                    <DialogDescription>
                        Review the document and approve or reject it
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Document Info */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Document Type</Label>
                            <p className="font-medium">{getDocumentTypeLabel(document.type)}</p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Status</Label>
                            <div>
                                <StatusBadge status={document.status} />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Uploaded
                            </Label>
                            <p className="font-medium">
                                {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                Worker ID
                            </Label>
                            <p className="font-medium">{document.workerId}</p>
                        </div>
                    </div>

                    {/* Document Preview/Download */}
                    <div className="space-y-2">
                        <Label className="text-muted-foreground">Document File</Label>
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <FileText className="h-8 w-8 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-medium text-sm">
                                    {getDocumentTypeLabel(document.type)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Click to view or download
                                </p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(document.fileUrl, "_blank")}
                                >
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const link = window.document.createElement("a");
                                        link.href = document.fileUrl;
                                        link.download = `${document.type}_${document.id}`;
                                        link.click();
                                    }}
                                >
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Previous Admin Comment */}
                    {document.adminComment && (
                        <div className="space-y-1">
                            <Label className="text-muted-foreground">Previous Comment</Label>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg">
                                {document.adminComment}
                            </p>
                        </div>
                    )}

                    {/* Reject Form */}
                    {showRejectForm && (
                        <div className="space-y-2 p-4 border border-destructive/50 rounded-lg bg-destructive/5">
                            <Label htmlFor="rejectComment">Rejection Comment</Label>
                            <Textarea
                                id="rejectComment"
                                placeholder="Please provide a reason for rejection..."
                                value={rejectComment}
                                onChange={(e) => setRejectComment(e.target.value)}
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
                                disabled={!rejectComment.trim() || isRejecting}
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
                                onClick={() => onApprove(document.id)}
                                disabled={isApproving}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {isApproving ? "Approving..." : "Approve Document"}
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DocumentsValidation() {
    const [selectedDocument, setSelectedDocument] = useState<WorkerDocument | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    const { data: pendingDocumentsData, isLoading } = useGetPendingDocumentsQuery();
    const [reviewDocument, { isLoading: isReviewingDocument }] = useReviewDocumentMutation();

    const pendingDocuments = pendingDocumentsData?.data || [];

    const handleViewDocument = (doc: WorkerDocument) => {
        setSelectedDocument(doc);
        setDialogOpen(true);
    };

    const handleApprove = (documentId: number) => {
        reviewDocument({ documentId, status: "APPROVED" })
            .unwrap()
            .then(() => {
                setDialogOpen(false);
                setSelectedDocument(null);
            });
    };

    const handleReject = (documentId: number, comment: string) => {
        reviewDocument({ documentId, status: "REJECTED", comment })
            .unwrap()
            .then(() => {
                setDialogOpen(false);
                setSelectedDocument(null);
            });
    };

    const getDocumentTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            DIPLOMA: "Diploma",
            CV: "Curriculum Vitae",
            ID: "Identity Document",
            OTHER: "Other Document",
        };
        return labels[type] || type;
    };

    const getDocumentTypeIcon = () => {
        return <FileText className="h-6 w-6 text-primary" />;
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Pending Document Reviews
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <Skeleton key={i} className="h-20 w-full" />
                            ))}
                        </div>
                    ) : pendingDocuments.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No pending documents"
                            description="All documents have been reviewed. Check back later for new uploads."
                        />
                    ) : (
                        <div className="space-y-4">
                            {pendingDocuments.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                            {getDocumentTypeIcon()}
                                        </div>
                                        <div>
                                            <p className="font-medium">
                                                {getDocumentTypeLabel(doc.type)}
                                            </p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <User className="h-3 w-3" />
                                                    Worker #{doc.workerId}
                                                </span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={doc.status} />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleViewDocument(doc)}
                                        >
                                            <Eye className="mr-2 h-4 w-4" />
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <DocumentReviewDialog
                document={selectedDocument}
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onApprove={handleApprove}
                onReject={handleReject}
                isApproving={isReviewingDocument && !selectedDocument?.adminComment}
                isRejecting={isReviewingDocument && !!selectedDocument?.adminComment}
            />
        </div>
    );
}

