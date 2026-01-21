import { Search, Filter, LayoutGrid, LayoutList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  ViewMode,
  DocumentStatusFilter,
} from "@/features/hooks/AdminHooks/useDocumentsValidation";

interface DocumentValidationHeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: DocumentStatusFilter;
  setStatusFilter: (status: DocumentStatusFilter) => void;
  typeFilter: string;
  setTypeFilter: (type: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  totalDocuments: number;
}

export function DocumentValidationHeader({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter,
  viewMode,
  setViewMode,
  totalDocuments,
}: DocumentValidationHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("ADMIN_VALIDATION.DOCUMENTS.TITLE")}
          </h1>
          <p className="text-muted-foreground">
            {t("ADMIN_VALIDATION.DOCUMENTS.SUBTITLE")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground font-medium bg-muted px-3 py-1 rounded-full">
            {totalDocuments} Documents
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("ADMIN_VALIDATION.DOCUMENTS.SEARCH_PLACEHOLDER")}
            className="pl-9 bg-muted/40 border-muted-foreground/20"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as DocumentStatusFilter)}
          >
            <SelectTrigger className="w-[140px] bg-muted/40 border-muted-foreground/20">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue
                  placeholder={t("ADMIN_VALIDATION.WORKERS.STATUS_FILTER")}
                />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">
                {t("ADMIN_VALIDATION.DOCUMENTS.ALL_TYPES")}
              </SelectItem>
              <SelectItem value="PENDING">{t("COMMON.PENDING")}</SelectItem>
              <SelectItem value="APPROVED">
                {t("PENDING_DOCS.APPROVE")}
              </SelectItem>
              <SelectItem value="REJECTED">
                {t("PENDING_DOCS.REJECT")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[160px] bg-muted/40 border-muted-foreground/20">
              <SelectValue
                placeholder={t("ADMIN_VALIDATION.DOCUMENTS.TYPE_FILTER")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("ADMIN_VALIDATION.DOCUMENTS.ALL_TYPES")}
              </SelectItem>
              <SelectItem value="DIPLOMA">
                {t("PENDING_DOCS.TYPE_DIPLOMA")}
              </SelectItem>
              <SelectItem value="ID">{t("PENDING_DOCS.TYPE_ID")}</SelectItem>
              <SelectItem value="CV">CV</SelectItem>
              <SelectItem value="LICENSE">
                {t("PENDING_DOCS.TYPE_LICENSE")}
              </SelectItem>
            </SelectContent>
          </Select>

          <div className="h-6 w-px bg-border mx-1" />

          <div className="flex items-center bg-muted/30 p-1.5 rounded-xl border border-border/60 backdrop-blur-sm shadow-inner overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "h-8 px-4 gap-2 transition-all duration-300",
                viewMode === "table"
                  ? "bg-background text-primary shadow-sm hover:bg-background font-bold rounded-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              <LayoutList className="h-4 w-4" />
              <span className="text-xs">
                {t("ADMIN_VALIDATION.WORKERS.TABLE_VIEW")}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "h-8 px-4 gap-2 transition-all duration-300",
                viewMode === "grid"
                  ? "bg-background text-primary shadow-sm hover:bg-background font-bold rounded-lg"
                  : "text-muted-foreground hover:text-foreground hover:bg-transparent"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span className="text-xs">
                {t("ADMIN_VALIDATION.WORKERS.GRID_VIEW")}
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
