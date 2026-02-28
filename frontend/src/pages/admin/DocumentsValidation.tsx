import { useDocumentsValidation } from "@/features/hooks/AdminHooks/useDocumentsValidation";
import { DocumentValidationHeader } from "@/components/admin/validation/DocumentValidationHeader";
import { DocumentValidationGrid } from "@/components/admin/validation/DocumentValidationGrid";
import { DocumentValidationTable } from "@/components/admin/validation/DocumentValidationTable";
import { DocumentReviewDialog } from "@/components/admin/validation/DocumentReviewDialog";
import { PaginationControls } from "@/components/common/PaginationControls";
import { useGetPendingDocumentsQuery } from "@/features/api/endpoints/adminEndpoints";

export default function DocumentsValidation() {
  const {
    documents,
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
    setViewMode,
    page,
    setPage,
    pageSize,
    setPageSize,
    selectedDocument,
    dialogOpen,
    setDialogOpen,
    handleOpenDocument,
    handleApprove,
    handleReject,
  } = useDocumentsValidation();

  // Fetch stats for header cards
  const { data: pendingStatsData } = useGetPendingDocumentsQuery({
    page: 1,
    limit: 1,
    status: 'PENDING'
  });

  const { data: rejectedStatsData } = useGetPendingDocumentsQuery({
    page: 1,
    limit: 1,
    status: 'REJECTED'
  });

  return (
    <div className="space-y-10 pb-12 font-spline animate-in fade-in duration-700">
      <DocumentValidationHeader
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        typeFilter={typeFilter}
        setTypeFilter={setTypeFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalDocuments={pagination?.total || 0}
        pendingCount={pendingStatsData?.pagination?.total ?? 0}
        rejectedCount={rejectedStatsData?.pagination?.total ?? 0}
      />

      {viewMode === "table" ? (
        <DocumentValidationTable
          documents={documents}
          isLoading={isLoading}
          onView={handleOpenDocument}
        />
      ) : (
        <DocumentValidationGrid
          documents={documents}
          isLoading={isLoading}
          onView={handleOpenDocument}
        />
      )}

      {/* Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="mt-8 border-t pt-4">
          <PaginationControls
            currentPage={page}
            totalPages={pagination.totalPages}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setPage={setPage}
            totalItems={pagination.total}
          />
        </div>
      )}

      <DocumentReviewDialog
        document={selectedDocument}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onApprove={handleApprove}
        onReject={handleReject}
        isApproving={isReviewing}
        isRejecting={isReviewing}
      />
    </div>
  );
}
