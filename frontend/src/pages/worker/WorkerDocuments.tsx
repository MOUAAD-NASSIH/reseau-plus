import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
    Upload,
    Lock,
    FolderOpen,
    CheckCircle2,
    AlertCircle,
    Clock,
    Calendar,
    CloudUpload,
    FileText,
    X,
    GraduationCap,
    IdCard,
    ExternalLink,
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
    const { t } = useTranslation();
    const { data: documentsData, isLoading } = useGetWorkerDocumentsQuery();
    const [uploadDocument, { isLoading: isUploading }] = useUploadDocumentMutation();
    const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [documentType, setDocumentType] = useState<DocumentType>("DIPLOMA");
    const [documentTitle, setDocumentTitle] = useState("");
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
            showErrorToast(t("WORKER_DOCUMENTS.MESSAGES.INVALID_TYPE"), t("WORKER_DOCUMENTS.MESSAGES.Please_PDF"));
            return;
        }

        // Validate file size (10MB)
        if (file.size > 10 * 1024 * 1024) {
            showErrorToast(t("WORKER_DOCUMENTS.MESSAGES.FILE_TOO_LARGE"), t("WORKER_DOCUMENTS.MESSAGES.SIZE_LIMIT"));
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
                title: documentTitle,
            }).unwrap();

            showSuccessToast(t("WORKER_DOCUMENTS.MESSAGES.UPLOAD_SUCCESS"), t("WORKER_DOCUMENTS.MESSAGES.UPLOAD_SUCCESS_DESC"));

            setIsUploadDialogOpen(false);
            setSelectedFile(null);
            setDocumentTitle("");
            setDocumentType("DIPLOMA");
        } catch (error) {
            showErrorToast(error, t("WORKER_DOCUMENTS.MESSAGES.UPLOAD_ERROR"));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const getDocumentIcon = (type: string) => {
        switch (type) {
            case "DIPLOMA":
                return <GraduationCap className="h-7 w-7" />;
            case "ID":
                return <IdCard className="h-7 w-7" />;
            case "CV":
            default:
                return <FileText className="h-7 w-7" />;
        }
    };

    const getDocumentIconColor = (type: string) => {
        switch (type) {
            case "DIPLOMA":
                return "bg-primary/10 text-primary";
            case "ID":
                return "bg-blue-500/10 text-blue-400";
            case "CV":
            default:
                return "bg-purple-500/10 text-purple-400";
        }
    };

    const handleViewDocument = (fileUrl: string) => {
        // Simply open the Cloudinary URL in a new tab
        window.open(fileUrl, '_blank');
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "APPROVED":
                return (
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold border-primary/20"
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" /> {t("WORKER_DOCUMENTS.LIST.STATUS.VERIFIED")}
                    </Badge>
                );
            case "PENDING":
                return (
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-bold border-yellow-500/20"
                    >
                        <Clock className="h-3.5 w-3.5" /> {t("WORKER_DOCUMENTS.LIST.STATUS.PENDING")}
                    </Badge>
                );
            case "REJECTED":
                return (
                    <Badge
                        variant="outline"
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs font-bold border-destructive/20"
                    >
                        <AlertCircle className="h-3.5 w-3.5" /> {t("WORKER_DOCUMENTS.LIST.STATUS.REJECTED")}
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
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto sm:p-4">
                <div className="flex flex-col gap-8">
                    {/* Page Heading */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div className="flex flex-col gap-2 max-w-2xl">
                            <div className="flex items-center gap-2 text-primary text-sm font-medium mb-1">
                                <Lock className="h-4 w-4" />
                                <span>{t("WORKER_DOCUMENTS.SECURE_MSG")}</span>
                            </div>
                            <h1 className="text-foreground font-spline text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                                {t("WORKER_DOCUMENTS.TITLE")}
                            </h1>
                            <p className="text-muted-foreground text-base md:text-lg font-normal">
                                {t("WORKER_DOCUMENTS.SUBTITLE")}
                            </p>
                        </div>
                        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    className="flex shrink-0 items-center gap-2 btn-glow"
                                    onClick={() => setIsUploadDialogOpen(true)}
                                >
                                    <Upload className="h-4 w-4" />
                                    <span className="truncate">{t("WORKER_DOCUMENTS.UPLOAD_BTN")}</span>
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                                <DialogHeader>
                                    <DialogTitle>{t("WORKER_DOCUMENTS.DIALOG.TITLE")}</DialogTitle>
                                    <DialogDescription>
                                        {t("WORKER_DOCUMENTS.DIALOG.DESC")}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="documentType">{t("WORKER_DOCUMENTS.DIALOG.TYPE_LABEL")}</Label>
                                        <Select
                                            value={documentType}
                                            onValueChange={(value) => {
                                                setDocumentType(value as DocumentType);
                                                // Clear title if switching away from DIPLOMA
                                                if (value !== "DIPLOMA") {
                                                    setDocumentTitle("");
                                                }
                                            }}
                                        >
                                            <SelectTrigger id="documentType">
                                                <SelectValue placeholder={t("WORKER_DOCUMENTS.DIALOG.TYPE_PLACEHOLDER")} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DIPLOMA">{t("WORKER_DOCUMENTS.DIALOG.TYPES.DIPLOMA")}</SelectItem>
                                                <SelectItem value="CV">{t("WORKER_DOCUMENTS.DIALOG.TYPES.CV")}</SelectItem>
                                                <SelectItem value="ID">{t("WORKER_DOCUMENTS.DIALOG.TYPES.ID")}</SelectItem>
                                                <SelectItem value="OTHER">{t("WORKER_DOCUMENTS.DIALOG.TYPES.OTHER")}</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {documentType === "DIPLOMA" && (
                                        <div className="space-y-2">
                                            <Label htmlFor="documentTitle">
                                                {t("WORKER_DOCUMENTS.DIALOG.DOC_TITLE_LABEL")}
                                            </Label>
                                            <Input
                                                id="documentTitle"
                                                placeholder={t("WORKER_DOCUMENTS.DIALOG.DOC_TITLE_PLACEHOLDER")}
                                                value={documentTitle}
                                                className="placeholder:opacity-40"
                                                onChange={(e) => setDocumentTitle(e.target.value)}
                                            />
                                        </div>
                                    )}

                                    <div className="space-y-2">
                                        <Label>{t("WORKER_DOCUMENTS.DIALOG.FILE_LABEL")}</Label>
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
                                                    {t("WORKER_DOCUMENTS.DIALOG.DRAG_DROP")}
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
                                            setDocumentTitle("");
                                        }}
                                    >
                                        {t("WORKER_DOCUMENTS.DIALOG.CANCEL")}
                                    </Button>
                                    <Button
                                        onClick={handleUpload}
                                        disabled={!selectedFile || isUploading}
                                    >
                                        {isUploading ? t("WORKER_DOCUMENTS.DIALOG.UPLOADING") : t("WORKER_DOCUMENTS.DIALOG.UPLOAD")}
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
                                {t("WORKER_DOCUMENTS.STATS.TOTAL")}
                            </p>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{totalDocs}</p>
                            {totalDocs > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-primary text-sm font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                                        {t("WORKER_DOCUMENTS.STATS.UPLOADED", { count: totalDocs })}
                                    </span>
                                </div>
                            )}
                        </Card>

                        <Card className="flex flex-col gap-1 rounded-2xl p-6 border border-border relative overflow-hidden group hover:border-primary/30 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <CheckCircle2 className="h-20 w-20 text-primary" />
                            </div>
                            <p className="text-muted-foreground text-sm font-medium uppercase tracking-wider">
                                {t("WORKER_DOCUMENTS.STATS.VERIFIED")}
                            </p>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{verifiedDocs}</p>
                            <p className="text-muted-foreground text-sm mt-2">{t("WORKER_DOCUMENTS.STATS.READY_MSG")}</p>
                        </Card>

                        <Card className="flex flex-col gap-1 rounded-2xl p-6 border border-destructive/50 relative overflow-hidden group hover:border-destructive/50 transition-colors">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <AlertCircle className="h-20 w-20 text-destructive" />
                            </div>
                            <p className="text-destructive text-sm font-medium uppercase tracking-wider">
                                {t("WORKER_DOCUMENTS.STATS.ACTION_REQUIRED")}
                            </p>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{rejectedDocs}</p>
                            {rejectedDocs > 0 && (
                                <div className="flex items-center gap-1 mt-2">
                                    <span className="text-destructive text-sm font-medium bg-destructive/30 px-2 py-0.5 rounded-full">
                                        {t("WORKER_DOCUMENTS.STATS.CHECK_REJECTED")}
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
                            className={`flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed ${dragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                                } bg-card/30 px-6 py-10 transition-colors cursor-pointer group`}
                        >
                            <div className="size-16 rounded-full bg-card flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                <CloudUpload className="h-8 w-8 text-primary" />
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <p className="text-foreground text-lg font-bold text-center">
                                    {t("WORKER_DOCUMENTS.DIALOG.DRAG_DROP_TITLE")}
                                </p>
                                <p className="text-muted-foreground text-sm font-normal text-center max-w-sm">
                                    {t("WORKER_DOCUMENTS.DIALOG.DRAG_DROP_DESC")}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Documents List */}
                    <div className="flex flex-col gap-4">
                        <h3 className="text-foreground text-xl font-bold">{t("WORKER_DOCUMENTS.LIST.TITLE")}</h3>
                        <div className="grid grid-cols-1 gap-4">
                            {documents.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                    <p className="text-foreground font-medium mb-2">{t("WORKER_DOCUMENTS.LIST.EMPTY_TITLE")}</p>
                                    <p className="text-muted-foreground text-sm">
                                        {t("WORKER_DOCUMENTS.LIST.EMPTY_DESC")}
                                    </p>
                                </Card>
                            ) : (
                                documents.map((doc) => (
                                    <Card
                                        key={doc.id}
                                        className={`group flex flex-col sm:flex-row items-start gap-4 p-4 rounded-2xl border hover:border-primary/30 hover:shadow-md transition-all relative overflow-hidden ${doc.status === "REJECTED"
                                            ? "border-destructive/30 bg-destructive/5"
                                            : "border-border"
                                            }`}
                                    >
                                        {doc.status === "REJECTED" && (
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>
                                        )}

                                        {/* Document Icon */}
                                        <div className="flex gap-3 items-start w-full sm:w-auto">
                                            <div
                                                className={`size-20 shrink-0 rounded-xl ${getDocumentIconColor(
                                                    doc.type
                                                )} flex items-center justify-center border border-border/50`}
                                            >
                                                {getDocumentIcon(doc.type)}
                                            </div>

                                            {/* Document Info */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h4 className="text-foreground font-bold text-base">
                                                        {t(`WORKER_DOCUMENTS.DIALOG.TYPES.${doc.type}` as any) || doc.type}
                                                    </h4>
                                                    {doc.title && (
                                                        <span className="text-sm text-muted-foreground font-medium truncate max-w-[200px]">
                                                            - {doc.title}
                                                        </span>
                                                    )}
                                                    <span className="hidden sm:inline-flex">
                                                        {getStatusBadge(doc.status)}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {doc.adminComment && (
                                                    <div className="mt-2 p-2 rounded-lg bg-destructive/10 border border-destructive/20">
                                                        <p className="text-sm text-destructive font-medium">
                                                            <AlertCircle className="h-4 w-4 inline mr-1" />
                                                            {t("WORKER_DOCUMENTS.LIST.REASON", { reason: doc.adminComment })}
                                                        </p>
                                                    </div>
                                                )}
                                                <div className="mt-2 sm:hidden">{getStatusBadge(doc.status)}</div>
                                            </div>
                                        </div>

                                        {/* Action Button */}
                                        <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDocument(doc.fileUrl)}
                                                className="gap-2 flex-1 sm:flex-initial"
                                            >
                                                <ExternalLink className="h-4 w-4" />
                                                <span className="sm:inline">{t("WORKER_DOCUMENTS.LIST.VIEW_BTN")}</span>
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
                            {t("WORKER_DOCUMENTS.FOOTER")}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

