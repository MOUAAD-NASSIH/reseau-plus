import { useState, useMemo } from "react";

import { useDebounce } from "@/hooks/use-debounce";
import { useGetPendingDocumentsQuery, useReviewDocumentMutation } from "@/features/api/endpoints/adminEndpoints";
import { showSuccessToast, showErrorToast } from "@/lib/toast";
import type { WorkerDocument } from "@/types/auth.types";
import { useTranslation } from "react-i18next";

export type ViewMode = "table" | "grid";
export type DocumentStatusFilter = "PENDING" | "APPROVED" | "REJECTED" | "ALL";

export function useDocumentsValidation() {
    const { t } = useTranslation();


    // State
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<DocumentStatusFilter>("PENDING");
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<ViewMode>("grid");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(9);
    const [selectedDocument, setSelectedDocument] = useState<WorkerDocument | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);

    // Derived state
    const debouncedSearch = useDebounce(searchQuery, 300);

    // API
    const { data: documentsData, isLoading } = useGetPendingDocumentsQuery({
        page,
        limit: pageSize,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        status: statusFilter === 'ALL' ? 'ALL' : statusFilter
    });

    const [reviewDocument, { isLoading: isReviewing }] = useReviewDocumentMutation();

    const documents = documentsData?.data || [];
    const pagination = documentsData?.pagination;

    // Handlers
    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleViewModeChange = (mode: ViewMode) => {
        setViewMode(mode);
    };

    const handleOpenDocument = (doc: WorkerDocument) => {
        setSelectedDocument(doc);
        setDialogOpen(true);
    };

    const handleApprove = async (documentId: number) => {
        try {
            await reviewDocument({ documentId, status: "APPROVED" }).unwrap();
            showSuccessToast(t("COMMON.SUCCESS"), t("ADMIN_VALIDATION.DOCUMENTS.MESSAGES.APPROVED"));
            setDialogOpen(false);
            setSelectedDocument(null);
        } catch (error) {
            showErrorToast(error, t("COMMON.UNEXPECTED_ERROR"));
        }
    };

    const handleReject = async (documentId: number, comment: string) => {
        try {
            await reviewDocument({ documentId, status: "REJECTED", comment }).unwrap();
            showSuccessToast(t("COMMON.SUCCESS"), t("ADMIN_VALIDATION.DOCUMENTS.MESSAGES.REJECTED"));
            setDialogOpen(false);
            setSelectedDocument(null);
        } catch (error) {
            showErrorToast(error, t("COMMON.UNEXPECTED_ERROR"));
        }
    };

    // Filter documents by search query (client-side for now as backend search isn't implemented strictly for docs)
    // Note: Ideally backend should handle search. For now we search in the current page
    const filteredDocuments = useMemo(() => {
        if (!debouncedSearch) return documents;

        const lowerSearch = debouncedSearch.toLowerCase();
        return documents.filter((doc) => {
            const workerName = doc.worker
                ? `${doc.worker.firstName} ${doc.worker.lastName}`.toLowerCase()
                : "";
            const workerEmail = doc.worker?.user?.email?.toLowerCase() || "";
            return workerName.includes(lowerSearch) || workerEmail.includes(lowerSearch);
        });
    }, [documents, debouncedSearch]);

    return {
        documents: filteredDocuments,
        pagination,
        isLoading,
        isReviewing,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        typeFilter,
        setTypeFilter,
        viewMode,
        setViewMode: handleViewModeChange,
        page,
        setPage: handlePageChange,
        pageSize,
        setPageSize,
        selectedDocument,
        setSelectedDocument,
        dialogOpen,
        setDialogOpen,
        handleOpenDocument,
        handleApprove,
        handleReject
    };
}
