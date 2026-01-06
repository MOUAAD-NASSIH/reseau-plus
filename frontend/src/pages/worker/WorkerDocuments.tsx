import { useState, useRef } from "react";
import { FileText, Upload, Loader2, ExternalLink, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/common/StatusBadge";
import { EmptyState } from "@/components/common/EmptyState";
import {
    useGetWorkerDocumentsQuery,
    useUploadDocumentMutation,
} from "@/features/api/endpoints/workerEndpoints";
import type { DocumentType, WorkerDocument } from "@/types/auth.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const DOCUMENT_TYPES: { value: DocumentType; label: string; description: string }[] = [
    { value: "DIPLOMA", label: "Diploma", description: "Your professional diploma or degree" },
    { value: "CV", label: "CV / Resume", description: "Your curriculum vitae" },
    { value: "ID", label: "ID Document", description: "Government-issued identification" },
    { value: "OTHER", label: "Other", description: "Other relevant documents" },
];

interface DocumentCardProps {
    document: WorkerDocument;
}

function DocumentCard({ document }: DocumentCardProps) {
    const typeInfo = DOCUMENT_TYPES.find((t) => t.value === document.type);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-medium">{typeInfo?.label || document.type}</p>
                            <p className="text-xs text-muted-foreground">
                                Uploaded {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                            {document.adminComment && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Comment: {document.adminComment}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <StatusBadge status={document.status} />
                        <Button variant="ghost" size="icon" asChild>
                            <a href={document.fileUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                            </a>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default function WorkerDocuments() {
    const { data: documentsData, isLoading } = useGetWorkerDocumentsQuery();
    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [selectedType, setSelectedType] = useState<DocumentType>("DIPLOMA");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragActive, setIsDragActive] = useState(false);

    const documents = documentsData?.data || [];

    const handleFileSelect = (files: FileList | null) => {
        if (files && files.length > 0) {
            const file = files[0];
            const validTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
            if (!validTypes.includes(file.type)) {
                showErrorToast(null, "Invalid file type. Please upload PDF, PNG, or JPG.");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showErrorToast(null, "File too large. Maximum size is 10MB.");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    };

    const handleUpload = async () => {
        if (!selectedFile) return;
        try {
            await uploadDocument({ type: selectedType, file: selectedFile }).unwrap();
            showSuccessToast("Document uploaded", "Your document has been uploaded successfully.");
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = "";
        } catch (error) {
            showErrorToast(error, "Failed to upload document");
        }
    };

    const clearSelectedFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const documentsByType = DOCUMENT_TYPES.map((type) => ({
        ...type,
        documents: documents.filter((d) => d.type === type.value),
    }));

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upload Document</CardTitle>
                    <CardDescription>
                        Upload your professional documents for verification. Accepted formats: PDF, PNG, JPG (max 10MB)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Document Type</label>
                        <Select value={selectedType} onValueChange={(v) => setSelectedType(v as DocumentType)}>
                            <SelectTrigger className="w-full md:w-64">
                                <SelectValue placeholder="Select document type" />
                            </SelectTrigger>
                            <SelectContent>
                                {DOCUMENT_TYPES.map((type) => (
                                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
                            isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                        )}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.png,.jpg,.jpeg"
                            onChange={(e) => handleFileSelect(e.target.files)}
                            className="hidden"
                        />
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                        {isDragActive ? (
                            <p className="text-sm text-primary">Drop the file here...</p>
                        ) : (
                            <div>
                                <p className="text-sm text-muted-foreground">Drag and drop a file here, or click to select</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, PNG, or JPG up to 10MB</p>
                            </div>
                        )}
                    </div>
                    {selectedFile && (
                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                            <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-sm font-medium">{selectedFile.name}</p>
                                    <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={clearSelectedFile}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button onClick={handleUpload} disabled={isUploading}>
                                    {isUploading ? (
                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</>
                                    ) : (
                                        <><Upload className="mr-2 h-4 w-4" />Upload</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Your Documents</CardTitle>
                    <CardDescription>Documents you have uploaded for verification</CardDescription>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                        </div>
                    ) : documents.length === 0 ? (
                        <EmptyState
                            icon={FileText}
                            title="No documents uploaded"
                            description="Upload your professional documents to get verified and start applying for missions."
                        />
                    ) : (
                        <div className="space-y-6">
                            {documentsByType.map((type) =>
                                type.documents.length > 0 && (
                                    <div key={type.value} className="space-y-3">
                                        <h3 className="text-sm font-medium text-muted-foreground">{type.label}</h3>
                                        <div className="space-y-2">
                                            {type.documents.map((doc) => <DocumentCard key={doc.id} document={doc} />)}
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Document Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {DOCUMENT_TYPES.map((type) => (
                            <div key={type.value} className="space-y-1">
                                <p className="font-medium text-sm">{type.label}</p>
                                <p className="text-xs text-muted-foreground">{type.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

