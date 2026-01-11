import { useState, useRef } from "react";
import {
    Upload,
    Download,
    MoreVertical,
    Lock,
    FolderOpen,
    CheckCircle2,
    AlertCircle,
    Clock,
    Calendar,
    CloudUpload,
    FileText,
    Menu,
    X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import {
    useGetWorkerDocumentsQuery,
    useUploadDocumentMutation,
} from "@/features/api/endpoints/workerEndpoints";
import type { DocumentType } from "@/types/auth.types";

export default function WorkerDocuments() {
    const { data: documentsData, isLoading } = useGetWorkerDocumentsQuery();
    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
    const [searchTerm, setSearchTerm] = useState("");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<DocumentType>("DIPLOMA");
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const documents = documentsData?.data || [];

    // Calculate stats
    const totalDocs = documents.length;
    const verifiedDocs = documents.filter((d) => d.status === "APPROVED").length;
    const rejectedDocs = documents.filter((d) => d.status === "REJECTED").length;

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelection(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelection = (file: File) => {
        // Validate file type
        if (file.type !== "application/pdf") {
            showErrorToast("Invalid file type", "Please upload a PDF file");
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast("File too large", "Please upload a file smaller than 10MB");
            return;
        }

        setSelectedFile(file);
        setIsUploadDialogOpen(true);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelection(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        try {
            await uploadDocument({
                type: documentType,
                file: selectedFile,
            }).unwrap();

            showSuccessToast("Document uploaded", "Your document has been uploaded successfully and is pending review");

            setIsUploadDialogOpen(false);
            setSelectedFile(null);
            setDocumentType("DIPLOMA");
        } catch (error: any) {
            showErrorToast(error, "Failed to upload document");
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border-primary/20"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> Verified
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border-yellow-500/20"
                    >
                        <Clock className="h-3.5 w-3.5" /> Pending Review
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-400 text-xs font-bold border-red-500/20"
                    >
                        <AlertCircle className="h-3.5 w-3.5" /> Rejected
                    </Badge>
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading-spinner loading-spinner-lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Top Navbar */}
            <header className="flex items-center justify-between h-16 px-6 lg:px-10 border-b border-border bg-card/95 backdrop-blur-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="lg:hidden text-foreground"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                    <h2 className="text-foreground text-lg font-bold leading-tight tracking-tight">
                        Worker Portal
                    </h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative hidden lg:block">
                        <svg
                            className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        <Input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search documents..."
                            className="pl-10 pr-4 w-64 bg-muted/50"
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-10">
                <div className="flex flex-col gap-8 pb-20">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                                <Lock className="h-4 w-4" />
                                <span>Encrypted & Secure Storage</span>
                            </div>
                            <h1 className="text-foreground text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                                My Professional Documents
                            </h1>
                            <p className="text-muted-foreground text-base md:text-lg font-normal">
                                Manage your diplomas and certifications to ensure mission eligibility.
                                Verified documents increase your visibility to institutions.
                            </p>
                        </div>
                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="flex shrink-0 items-center gap-2 btn-glow"
                                    onClick={() => setIsUploadDialogOpen(true)}
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="truncate">Upload Document</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>Upload Document</DialogTitle>
                                    <DialogDescription>
                                        Upload your professional documents (PDF only, max 10MB)
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="documentType">Document Type</Label>
                                        <Select
                                            value={documentType}
                                            onValueChange={(value) => setDocumentType(value as DocumentType)}
                                        >
                                            <SelectTrigger id="documentType">
                                                <SelectValue placeholder="Select document type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DIPLOMA">Diploma</SelectItem>
                                                <SelectItem value="CV">CV / Resume</SelectItem>
                                                <SelectItem value="ID">ID Card</SelectItem>
                                                <SelectItem value="OTHER">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>File</Label>
                                        {selectedFile ? (
                                            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                                                <div className="flex items-center gap-2">
                                                    <FileText className="h-5 w-5 text-primary" />
                                                    <div>
                                                        <p className="text-sm font-medium">{selectedFile.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setSelectedFile(null)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div
                                                onClick={triggerFileInput}
                                                className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary/50 bg-card/30 px-6 py-8 transition-colors cursor-pointer"
                                            >
                                                <CloudUpload className="h-8 w-8 text-primary" />
                                                <p className="text-sm text-muted-foreground">
                                                    Click to select or drag & drop
                                                </p>
                                            </div>
                                        )}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".pdf"
                                            onChange={handleFileInputChange}
                                            className="hidden"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsUploadDialogOpen(false);
                                            setSelectedFile(null);
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || isUploading}
                                    >
                                        {isUploading ? "Uploading..." : "Upload"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="flex flex-col gap-1 rounded-2xl p-6 border border-border relative overflow-hidden group hover:border-primary/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <FolderOpen className="h-20 w-20 text-foreground" />
                            </div>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                                Total Documents
                            </p>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{totalDocs}</p>
                            {totalDocs > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-primary text-sm font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                        +{totalDocs} uploaded
                                    </span>
                                </div>
                            )}
                        </Card>

                        <Card className="flex flex-col gap-1 rounded-2xl p-6 border border-border relative overflow-hidden group hover:border-primary/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle2 className="h-20 w-20 text-primary" />
                            </div>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                                Verified & Active
                            </p>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{verifiedDocs}</p>
                            <p className="text-muted-foreground text-sm mt-2">Ready for mission matching</p>
                        </Card>

                        <Card className="flex flex-col gap-1 rounded-2xl p-6 border border-red-900/50 relative overflow-hidden group hover:border-red-500/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertCircle className="h-20 w-20 text-red-400" />
                            </div>
                            <p className="text-red-300 text-sm font-medium uppercase tracking-wider">
                                Action Required
                            </p>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{rejectedDocs}</p>
                            {rejectedDocs > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-red-300 text-sm font-medium bg-red-900/30 px-2 py-0.5 rounded-full">
                                        Check rejected items
                                    </span>
                                </div>
                            )}
                        </Card>
                    </div>

                    {/* Upload Zone */}
                    <div className="flex flex-col">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileInputChange}
                            className="hidden"
                        />
                        <div
                            onClick={triggerFileInput}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed ${
                                dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            } bg-card/30 px-6 py-10 transition-colors cursor-pointer group`}
                        >
                            <div className="size-16 rounded-full bg-card flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <CloudUpload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-foreground text-lg font-bold text-center">
                                    Drag & drop your PDF here
                                </p>
                                <p className="text-muted-foreground text-sm font-normal text-center max-w-sm">
                                    Support for PDF files up to 10MB. We automatically scan for clarity
                                    and validity.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-foreground text-xl font-bold">Recent Uploads</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {documents.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-foreground font-medium mb-2">No documents uploaded</p>
                                    <p className="text-muted-foreground text-sm">
                                        Upload your first document to get started
                                    </p>
                                </Card>
                            ) : (
                                documents.map((doc) => (
                                    <Card
                                        key={doc.id}
                                        className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl border hover:bg-muted/50 transition-colors relative overflow-hidden ${
                                            doc.status === "REJECTED"
                                                ? "border-red-900/30"
                                                : "border-border"
                                        }`}
                                    >
                                        {doc.status === "REJECTED" && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                        )}
                                        <div
                                            className={`size-12 shrink-0 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 ${
                                                doc.status === "REJECTED" ? "ml-2" : ""
                                            }`}
                                        >
                                            <FileText className="h-7 w-7" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h4 className="text-foreground font-bold text-base truncate">
                                                    {doc.type}
                                                </h4>
                                                <span className="hidden sm:inline-flex">
                                                    {getStatusBadge(doc.status)}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(doc.uploadedAt).toLocaleDateString()}
                                                </span>
                                                <span className="hidden sm:inline">•</span>
                                                <span>2.4 MB</span>
                                            </div>
                                            {doc.adminComment && (
                                                <p className="text-sm text-red-300 font-medium mt-1">
                                                    Reason: {doc.adminComment}
                                                </p>
                                            )}
                                            <div className="mt-2 sm:hidden">{getStatusBadge(doc.status)}</div>
                                        </div>
                                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                                            {doc.status === "REJECTED" ? (
                                                <Button className="bg-red-500 text-white hover:bg-red-600 w-full sm:w-auto">
                                                    Re-upload
                                                </Button>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="rounded-full"
                                                    title="Download"
                                                >
                                                    <Download className="h-5 w-5" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="rounded-full"
                                                title="More options"
                                            >
                                                <MoreVertical className="h-5 w-5" />
                                            </Button>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="flex justify-center mt-8">
                        <p className="text-foreground/30 text-xs text-center">
                            Your documents are processed in accordance with GDPR regulations.
                            <br />
                            Need assistance? Contact support.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

