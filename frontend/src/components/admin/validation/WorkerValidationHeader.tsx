import {
  Search,
  Filter,
  LayoutGrid,
  List,
  Users,
  Clock,
  XCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { ViewMode } from "../../../features/hooks/AdminHooks/useWorkersValidation";
import { cn } from "@/lib/utils";

interface WorkerValidationHeaderProps {
  stats: {
    pending: number;
    rejected: number;
    total: number;
  };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export function WorkerValidationHeader({
  stats,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
}: WorkerValidationHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            {t("ADMIN_VALIDATION.WORKERS.TITLE")}
          </h1>
          <p className="text-muted-foreground mt-2 text-lg max-w-2xl">
            {t("ADMIN_VALIDATION.WORKERS.SUBTITLE")}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full sm:w-[500px]">
          {/* Pending Stats */}
          <Card className="border-amber-200/60 dark:border-amber-500/10 bg-linear-to-br from-amber-50/80 to-amber-100/40 dark:from-amber-500/10 dark:to-amber-500/5 backdrop-blur-xl shadow-lg shadow-amber-500/5 dark:shadow-none group hover:shadow-xl hover:border-amber-300/50 dark:hover:border-amber-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] font-black text-amber-700/70 dark:text-amber-400/70 uppercase tracking-widest">
                {t("ADMIN_VALIDATION.WORKERS.STATS.PENDING")}
              </CardTitle>
              <div className="h-8 w-8 bg-white/60 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-amber-200/50 dark:border-amber-500/20 shadow-sm">
                <Clock className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-amber-900 dark:text-amber-100">
                {stats.pending}
              </div>
            </CardContent>
          </Card>

          {/* Rejected Stats */}
          <Card className="border-red-200/60 dark:border-red-500/10 bg-linear-to-br from-red-50/80 to-red-100/40 dark:from-red-500/10 dark:to-red-500/5 backdrop-blur-xl shadow-lg shadow-red-500/5 dark:shadow-none group hover:shadow-xl hover:border-red-300/50 dark:hover:border-red-500/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] font-black text-red-700/70 dark:text-red-400/70 uppercase tracking-widest">
                {t("ADMIN_VALIDATION.WORKERS.STATS.REJECTED")}
              </CardTitle>
              <div className="h-8 w-8 bg-white/60 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-red-200/50 dark:border-red-500/20 shadow-sm">
                <XCircle className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-red-900 dark:text-red-100">
                {stats.rejected}
              </div>
            </CardContent>
          </Card>

          {/* Total Stats */}
          <Card className="border-primary/20 dark:border-primary/10 bg-linear-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 backdrop-blur-xl shadow-lg shadow-primary/5 dark:shadow-none group hover:shadow-xl hover:border-primary/30 dark:hover:border-primary/20 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-4">
              <CardTitle className="text-[10px] font-black text-primary/70 dark:text-primary/60 uppercase tracking-widest">
                {t("ADMIN_VALIDATION.WORKERS.STATS.TOTAL")}
              </CardTitle>
              <div className="h-8 w-8 bg-white/60 dark:bg-primary/10 text-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-primary/20 dark:border-primary/10 shadow-sm">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-2xl font-black text-foreground">
                {stats.total}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between bg-card/40 p-4 rounded-2xl border border-border/40 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row gap-4 flex-1">
          <div className="relative w-full md:w-[350px] group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input
              placeholder={t("ADMIN_VALIDATION.WORKERS.SEARCH_PLACEHOLDER")}
              className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background transition-all rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 w-full md:w-[180px] bg-background/50 border-border/50 rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue
                    placeholder={t("ADMIN_VALIDATION.WORKERS.STATUS_FILTER")}
                  />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="pending">{t("COMMON.PENDING")}</SelectItem>
                <SelectItem value="all">
                  {t("ADMIN_VALIDATION.WORKERS.ALL_STATUSES")}
                </SelectItem>
                <SelectItem value="verified">
                  {t("COMMON.COMPLETED")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center w-full md:w-auto bg-muted/30 p-1.5 rounded-xl border border-border/60 backdrop-blur-sm shadow-inner overflow-hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("table")}
            className={cn(
              "h-8 px-4 gap-2 transition-all duration-300 flex-1 md:flex-initial",
              viewMode === "table"
                ? "bg-background text-primary shadow-sm hover:bg-background font-bold rounded-lg"
                : "text-muted-foreground hover:text-foreground hover:bg-transparent"
            )}
          >
            <List className="h-4 w-4" />
            <span className="text-xs">
              {t("ADMIN_VALIDATION.WORKERS.TABLE_VIEW")}
            </span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode("grid")}
            className={cn(
              "h-8 px-4 gap-2 transition-all duration-300 flex-1 md:flex-initial",
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
  );
}
