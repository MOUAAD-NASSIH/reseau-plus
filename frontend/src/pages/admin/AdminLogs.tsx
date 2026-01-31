import { useTranslation } from "react-i18next";
import {
  FileText,
  Search,
  X,
  Calendar,
  User,
  Eye,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAdminLogs } from "@/features/hooks/AdminHooks/useAdminLogs";
import { AdminLogsStats } from "@/components/admin/logs/AdminLogsStats";
import { type AdminLog } from "@/features/api/endpoints/adminEndpoints";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";

;

// Action type badge colors with premium palette
const actionTypeColors: Record<string, string> = {
  VERIFY_WORKER: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  REJECT_WORKER: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  APPROVE_DOCUMENT: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  REJECT_DOCUMENT: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  UPDATE_USER_STATUS: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  CREATE_DOMAIN: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  UPDATE_DOMAIN: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  DELETE_DOMAIN: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

interface LogDetailsDialogProps {
  log: AdminLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function LogDetailsDialog({ log, open, onOpenChange }: LogDetailsDialogProps) {
  const { t, i18n } = useTranslation();
  if (!log) return null;

  const dateLocale = i18n.language === "fr" ? fr : enUS;
  
  const getTargetName = () => {
    if (!log.targetUser) return null;
    if (log.targetUser.worker) {
      return `${log.targetUser.worker.firstName} ${log.targetUser.worker.lastName}`;
    }
    if (log.targetUser.institution) {
      return log.targetUser.institution.institutionName;
    }
    return log.targetUser.email;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border/40 shadow-xl rounded-2xl p-0 overflow-hidden font-spline">
        {/* Simple Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center border shadow-sm ${
                            log.actionType.includes("REJECT") ? "bg-red-500/10 text-red-500 border-red-500/20" : 
                            log.actionType.includes("VERIFY") || log.actionType.includes("APPROVE") ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                            "bg-primary/10 text-primary border-primary/20"
                    }`}>
                        {log.actionType.includes("DOCUMENT") ? <FileText className="h-5 w-5" /> : 
                        log.actionType.includes("WORKER") ? <ShieldCheck className="h-5 w-5" /> : 
                        <Activity className="h-5 w-5" />}
                    </div>
                    <div className="space-y-0.5">
                        <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                            {t("ADMIN_LOGS.DIALOG.TITLE")}
                        </DialogTitle>
                        <DialogDescription className="text-xs font-medium text-muted-foreground uppercase tracking-widest">
                             LOG #{log.id}
                        </DialogDescription>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={`font-bold tracking-widest text-[10px] uppercase py-1 px-2.5 ${
                    actionTypeColors[log.actionType] ||
                    "bg-muted/30 text-muted-foreground border-border/40"
                    }`}
                >
                    {log.actionType.replace(/_/g, " ")}
                </Badge>
            </div>
        </DialogHeader>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]">
            {/* Rejection/Action Reason - Prominent if exists */}
            {log.reason && (
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex gap-3">
                    <X className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                         <h4 className="text-sm font-bold text-red-600">
                            {t("ADMIN_LOGS.DIALOG.REJECTION_REASON")}
                         </h4>
                         <p className="text-sm text-foreground/80 leading-relaxed">
                            {log.reason}
                         </p>
                    </div>
                </div>
            )}

            {/* Info Grid - Simplified */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* ADMIN CARD */}
                <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3" />
                        {t("ADMIN_LOGS.DIALOG.EXECUTED_BY")}
                    </Label>
                    <div>
                        <p className="font-bold text-sm truncate" title={log.admin?.email}>
                            {log.admin?.email}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                            ID: #{log.adminId}
                        </p>
                    </div>
                </div>

                {/* TARGET CARD */}
                {log.targetUserId && (
                    <div className="bg-muted/30 p-4 rounded-xl border border-border/50 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70 flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {t("ADMIN_LOGS.DIALOG.TARGET_USER")}
                        </Label>
                        <div>
                            <p className="font-bold text-sm truncate">
                                {getTargetName()}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs bg-background px-1.5 py-0.5 rounded border border-border/20 text-muted-foreground font-medium">
                                    {log.targetUser?.role?.name || "USER"}
                                </span>
                                <span className="text-xs text-muted-foreground font-mono">
                                    ID: #{log.targetUserId}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
          
           {/* Context Data - Simplified List */}
           {(log.targetDocument || log.targetMission) && (
               <div className="space-y-2">
                   <Label className="text-xs font-semibold text-muted-foreground ml-1">
                        {t("ADMIN_LOGS.DIALOG.CONTEXT_DATA")}
                   </Label>
                   <div className="grid gap-2">
                       {log.targetDocument && (
                           <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 shadow-sm group hover:border-blue-500/30 transition-colors">
                               <div className="flex items-center gap-3">
                                   <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center">
                                       <FileText className="h-4 w-4" />
                                   </div>
                                   <div>
                                       <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t("ADMIN_LOGS.DIALOG.AFFECTED_DOCUMENT")}
                                       </p>
                                       <p className="text-sm font-semibold text-foreground">{log.targetDocument.type}</p>
                                   </div>
                               </div>
                               <div className="flex items-center gap-2">
                                     {log.targetDocument.fileUrl && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-blue-600 hover:bg-blue-500/10"
                                            onClick={() => window.open(log.targetDocument!.fileUrl, "_blank")}
                                            title={t("COMMON.VIEW_DETAILS")}
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                     )}
                                    <Badge variant="secondary" className="font-mono text-[10px]">ID: {log.targetDocument.id}</Badge>
                               </div>
                           </div>
                       )}
                       
                       {log.targetMission && (
                           <div className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 shadow-sm">
                               <div className="flex items-center gap-3">
                                   <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                                       <ShieldCheck className="h-4 w-4" />
                                   </div>
                                   <div>
                                       <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                            {t("ADMIN_LOGS.DIALOG.AFFECTED_MISSION")}
                                       </p>
                                       <p className="text-sm font-semibold text-foreground">{log.targetMission.title}</p>
                                   </div>
                               </div>
                                <Badge variant="secondary" className="font-mono text-[10px]">ID: {log.targetMission.id}</Badge>
                           </div>
                       )}
                   </div>
               </div>
           )}


          {/* Footer Metadata */}
          <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground border-t border-border/40 mt-2">
            <Calendar className="h-3.5 w-3.5" />
            <span className="font-medium">
                {t("ADMIN_LOGS.DIALOG.CREATED_AT")}:
            </span>
            <span>
                {format(new Date(log.createdAt), "PPP p", { locale: dateLocale })}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { PaginationControls } from "@/components/common/PaginationControls";

export default function AdminLogs() {
  const { t, i18n } = useTranslation();
  const {
    logs,
    isLoading,
    searchQuery,
    setSearchQuery,
    actionTypeFilter,
    setActionTypeFilter,
    selectedLog,
    dialogOpen,
    setDialogOpen,
    actionTypes,
    stats,
    handleViewLog,
    clearFilters,
    hasActiveFilters,
    dateFilter,
    setDateFilter,
    // Pagination
    page,
    setPage,
    pageSize,
    setPageSize,
    pagination
  } = useAdminLogs();

  const dateLocale = i18n.language === "fr" ? fr : enUS;

  console.log(logs);

  return (
    <div className="space-y-8 pb-8 animate-in fade-in duration-700 font-spline">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">
          {t("ADMIN_LOGS.TITLE")}
        </h1>
        <p className="text-lg text-muted-foreground font-medium max-w-2xl opacity-70">
          {t("ADMIN_LOGS.SUBTITLE")}
        </p>
      </div>

      {/* Stats Overview */}
      <AdminLogsStats stats={stats} isLoading={isLoading} />

      {/* Filters Section */}
      <Card className="border-border/40 shadow-xl shadow-primary/5 bg-card/60 backdrop-blur-xl rounded-4xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-row items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground opacity-40" />
              <Input
                placeholder={t("ADMIN_LOGS.FILTERS.SEARCH_PLACEHOLDER")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-14 bg-muted/30 border-border/40 rounded-2xl focus-visible:ring-primary/20 font-bold text-base"
              />
            </div>

            <Select
              value={actionTypeFilter}
              onValueChange={setActionTypeFilter}
            >
              <SelectTrigger className="w-[200px] h-14 bg-muted/30 border-border/40 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                <SelectValue
                  placeholder={t("ADMIN_LOGS.FILTERS.ACTION_TYPE")}
                />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40">
                <SelectItem
                  value="ALL"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                  {t("ADMIN_LOGS.FILTERS.ALL_ACTIONS")}
                </SelectItem>
                {actionTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="font-bold uppercase text-[10px] tracking-widest"
                  >
                    {type.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[180px] h-14 bg-muted/30 border-border/40 rounded-2xl font-black uppercase text-[10px] tracking-widest">
                 <SelectValue placeholder={t("ADMIN_LOGS.FILTERS.PERIOD")} />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-border/40">
                <SelectItem
                  value="ALL"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                   {t("ADMIN_LOGS.FILTERS.ALL_TIME")}
                </SelectItem>
                <SelectItem
                  value="TODAY"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                   {t("ADMIN_LOGS.FILTERS.TODAY")}
                </SelectItem>
                <SelectItem
                  value="YESTERDAY"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                   {t("ADMIN_LOGS.FILTERS.YESTERDAY")}
                </SelectItem>
                <SelectItem
                  value="LAST_7_DAYS"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                   {t("ADMIN_LOGS.FILTERS.LAST_7_DAYS")}
                </SelectItem>
                <SelectItem
                  value="LAST_30_DAYS"
                  className="font-black uppercase text-[10px] tracking-widest"
                >
                   {t("ADMIN_LOGS.FILTERS.LAST_30_DAYS")}
                </SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                size="icon"
                className="h-14 w-14 min-w-14 rounded-2xl border-border/40 bg-muted/30 hover:bg-primary/5 hover:text-primary transition-all group"
                title={t("ADMIN_LOGS.FILTERS.CLEAR")}
              >
                <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table Section */}
      <Card className="border-border/40 shadow-2xl shadow-primary/5 bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border-t-0">
        <CardHeader className="p-8 pb-4 border-b border-border/40 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-black tracking-tight">
                  {t("ADMIN_LOGS.LIST.TITLE")}
                </CardTitle>
                <p className="text-xs font-bold text-muted-foreground opacity-60 uppercase tracking-widest mt-0.5">
                  {t("ADMIN_LOGS.FILTERS.FOUND", { count: logs.length })}
                </p>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-2xl" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="py-20 px-4">
              <EmptyState
                icon={FileText}
                title={t("ADMIN_LOGS.LIST.EMPTY")}
                description={
                  hasActiveFilters
                    ? t("ADMIN_LOGS.LIST.EMPTY_DESC")
                    : t("ADMIN_LOGS.LIST.EMPTY_GENERIC")
                }
                action={
                  hasActiveFilters ? (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-[10px]"
                    >
                      {t("ADMIN_LOGS.FILTERS.CLEAR")}
                    </Button>
                  ) : undefined
                }
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/10">
                  <TableRow className="border-border/40 hover:bg-transparent">
                    <TableHead className="w-[100px] pl-8 text-[10px] font-black uppercase tracking-widest">
                      {t("ADMIN_LOGS.LIST.COLUMNS.ID")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      {t("ADMIN_LOGS.LIST.COLUMNS.ACTION")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      {t("ADMIN_LOGS.LIST.COLUMNS.ADMIN")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      {t("ADMIN_LOGS.LIST.COLUMNS.TARGET")}
                    </TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest">
                      {t("ADMIN_LOGS.LIST.COLUMNS.DATE")}
                    </TableHead>
                    <TableHead className="text-right pr-8 text-[10px] font-black uppercase tracking-widest">
                      {t("ADMIN_LOGS.LIST.COLUMNS.ACTIONS")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const getTargetName = () => {
                      if (!log.targetUser) return null;
                      if (log.targetUser.worker) {
                        return `${log.targetUser.worker.firstName} ${log.targetUser.worker.lastName}`;
                      }
                      if (log.targetUser.institution) {
                        return log.targetUser.institution.institutionName;
                      }
                      return log.targetUser.email;
                    };

                    return (
                      <TableRow
                        key={log.id}
                        className="group border-border/40 hover:bg-primary/4 transition-all duration-300"
                      >
                        <TableCell className="pl-8 font-mono text-xs font-bold opacity-40">
                          #{log.id.toString().padStart(4, "0")}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`font-black tracking-widest text-[9px] uppercase px-2 py-0.5 whitespace-nowrap shadow-sm ${
                              actionTypeColors[log.actionType] ||
                              "bg-muted/30 text-muted-foreground border-border/40"
                            }`}
                          >
                            {log.actionType.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                              <ShieldCheck className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex flex-col">
                              <span
                                className="font-bold text-sm tracking-tight text-foreground truncate max-w-[120px]"
                                title={log.admin?.email}
                              >
                                {log.admin?.email.split("@")[0]}
                              </span>
                              <span className="text-[9px] font-mono opacity-40 font-bold uppercase tracking-tighter">
                                ID: #{log.adminId}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.targetUserId ? (
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <User className="h-4 w-4 text-amber-500" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-sm tracking-tight text-foreground truncate max-w-[120px]">
                                  {getTargetName()}
                                </span>
                                <span className="text-[9px] font-mono opacity-40 font-bold uppercase tracking-tighter">
                                  ID: #{log.targetUserId}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground opacity-20 font-black text-[10px] tracking-widest px-2">
                              —
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[11px] font-black tracking-tight">
                              {format(new Date(log.createdAt), "dd MMM yyyy", {
                                locale: dateLocale,
                              })}
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-widest">
                              {format(new Date(log.createdAt), "HH:mm")}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="pr-8 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewLog(log)}
                            className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-widest bg-muted/30 border border-border/40 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-300 shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            {t("ADMIN_LOGS.LIST.VIEW")}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Log Details Dialog */}
      <LogDetailsDialog
        log={selectedLog}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

       {/* Pagination */}
       {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 border-t border-border/40 pt-6">
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
    </div>
  );
}
