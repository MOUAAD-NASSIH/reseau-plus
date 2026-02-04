import { useWorkersValidation } from "@/features/hooks/AdminHooks/useWorkersValidation";
import { WorkerValidationHeader } from "@/components/admin/validation/WorkerValidationHeader";
import { WorkerValidationTable } from "@/components/admin/validation/WorkerValidationTable";
import { WorkerValidationGrid } from "@/components/admin/validation/WorkerValidationGrid";
import { WorkerDetailsDialog } from "@/components/admin/validation/WorkerDetailsDialog";
import { PaginationControls } from "@/components/common/PaginationControls";

export default function WorkersValidation() {
  const {
    workers,
    isLoading,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    selectedWorker,
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
    page,
    setPage,
    pageSize,
    setPageSize,
    totalWorkers,
    totalPages,
  } = useWorkersValidation();

  return (
    <div className="space-y-10 pb-12 font-spline animate-in fade-in duration-700">
      <WorkerValidationHeader
        stats={stats}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {viewMode === "table" ? (
        <WorkerValidationTable
          workers={workers}
          isLoading={isLoading}
          onReview={openWorker}
        />
      ) : (
        <WorkerValidationGrid
          workers={workers}
          isLoading={isLoading}
          onReview={openWorker}
        />
      )}

      {!isLoading && totalPages > 1 && (
        <div className="mt-8 border-t pt-4">
          <PaginationControls
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            setPageSize={setPageSize}
            setPage={setPage}
            totalItems={totalWorkers}
          />
        </div>
      )}

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
        isApprovingDocument={isReviewingDocument}
        isRejectingDocument={isReviewingDocument}
        processingDocumentId={processingDocumentId}
      />
    </div>
  );
}
