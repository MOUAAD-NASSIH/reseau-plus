import { useState, useMemo, useCallback, useEffect } from "react";
import {
  useValidateWorkerMutation,
  useRejectWorkerMutation,
  useReviewDocumentMutation,
} from "@/features/api/endpoints/adminEndpoints";
import { useGetAllWorkersQuery } from "@/features/api/endpoints/workerEndpoints";
import type { Worker } from "@/types/auth.types";
import { showSuccessToast, showErrorToast } from "@/lib/toast";

export type ViewMode = "grid" | "table";

export function useWorkersValidation() {

  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingDocumentId, setProcessingDocumentId] = useState<number | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);

  const { data, isLoading, refetch } = useGetAllWorkersQuery({ limit: 100 });
  const allWorkers = data?.data || [];

  const selectedWorker = useMemo(() => {
    if (!selectedWorkerId) return null;
    return allWorkers.find(w => w.id === selectedWorkerId) || null;
  }, [allWorkers, selectedWorkerId]);

  // Filter logic
  const filteredWorkers = useMemo(() => {
    return allWorkers.filter((worker) => {
      const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
      const email = worker.user?.email.toLowerCase() || "";
      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        email.includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        worker.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [allWorkers, searchQuery, statusFilter]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination logic
  const paginatedWorkers = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    return filteredWorkers.slice(startIndex, startIndex + pageSize);
  }, [filteredWorkers, page, pageSize]);

  const totalPages = Math.ceil(filteredWorkers.length / pageSize);

  const [validateWorkerMutation, { isLoading: isValidating }] = useValidateWorkerMutation();
  const [rejectWorkerMutation, { isLoading: isRejecting }] = useRejectWorkerMutation();
  const [reviewDocumentMutation, { isLoading: isReviewingDocument }] = useReviewDocumentMutation();

  const openWorker = useCallback((worker: Worker) => {
    setSelectedWorkerId(worker.id);
    setDialogOpen(true);
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await validateWorkerMutation(id).unwrap();
      setDialogOpen(false);
      setSelectedWorkerId(null);
      showSuccessToast(
        "Worker Approved",
        "The worker has been successfully verified."
      );
    } catch (error) {
      showErrorToast(error, "Failed to approve worker.");
    }
  };

  const handleReject = async (id: number, reason: string) => {
    try {
      await rejectWorkerMutation({ workerId: id, reason }).unwrap();
      setDialogOpen(false);
      setSelectedWorkerId(null);
      showSuccessToast(
        "Worker Rejected",
        "The worker registration has been rejected."
      );
    } catch (error) {
      showErrorToast(error, "Failed to reject worker.");
    }
  };

  const handleApproveDocument = async (id: number) => {
    setProcessingDocumentId(id);
    try {
      await reviewDocumentMutation({ documentId: id, status: "APPROVED" }).unwrap();
      showSuccessToast("Document Approved", "The document has been verified.");
    } catch (error) {
      showErrorToast(error, "Failed to approve document.");
    } finally {
      setProcessingDocumentId(null);
    }
  };

  const handleRejectDocument = async (id: number, comment: string) => {
    setProcessingDocumentId(id);
    try {
      await reviewDocumentMutation({
        documentId: id,
        status: "REJECTED",
        comment,
      }).unwrap();
      showSuccessToast("Document Rejected", "The document has been rejected.");
    } catch (error) {
      showErrorToast(error, "Failed to reject document.");
    } finally {
      setProcessingDocumentId(null);
    }
  };

  // Stats for the header
  const stats = useMemo(() => {
    const pending = allWorkers.filter((w) => w.status === "PENDING").length;
    const verified = allWorkers.filter((w) => w.status === "VERIFIED").length;
    const rejected = allWorkers.filter((w) => w.status === "REJECTED").length;
    return {
      pending,
      verified,
      rejected,
      total: allWorkers.length,
    };
  }, [allWorkers]);

  return {
    workers: paginatedWorkers,
    isLoading,
    refetch,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    selectedWorker,
    setSelectedWorker: (w: Worker | null) => setSelectedWorkerId(w?.id ?? null),
    dialogOpen,
    setDialogOpen,
    processingDocumentId,
    openWorker,
    handleApprove,
    handleReject,
    handleApproveDocument,
    handleRejectDocument,
    isValidating,
    isRejecting,
    isReviewingDocument,
    stats,
    // Pagination exports
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalWorkers: filteredWorkers.length,
  };
}
