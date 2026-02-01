import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import { Eye, MapPin, Calendar, FileText, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DataTable, DataTableColumnHeader } from "@/components/common/DataTable";
import type { Worker } from "@/types/auth.types";
import { cn } from "@/lib/utils";

interface WorkerValidationTableProps {
  workers: Worker[];
  isLoading: boolean;
  onReview: (worker: Worker) => void;
}

export function WorkerValidationTable({ workers, isLoading, onReview }: WorkerValidationTableProps) {
  const { t } = useTranslation();

  const columns: ColumnDef<Worker>[] = useMemo(
    () => [
      {
        accessorKey: "firstName",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("ADMIN_VALIDATION.WORKERS.TABLE.WORKER")} />
        ),
        cell: ({ row }) => {
          const w = row.original;
          const initials = `${w.firstName?.[0] || ""}${w.lastName?.[0] || ""}`;
          const fullName = `${w.firstName} ${w.lastName}`;
          return (
            <div className="flex items-center gap-4 py-1">
              <Avatar className="h-11 w-11 border-2 border-background ring-2 ring-primary/5 shadow-md transition-transform hover:scale-110">
                <AvatarImage
                  src={w.profilePicture || w.user?.profilePicture || undefined}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="bg-linear-to-br from-primary/20 to-primary/5 text-primary font-black text-xs">
                  {initials || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {w.firstName} {w.lastName}
                </p>
                <span className="text-[11px] text-muted-foreground font-medium opacity-80">{w.user?.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "speciality",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("ADMIN_VALIDATION.WORKERS.SPECIALITY_LABEL")} />
        ),
        cell: ({ row }) => (
          row.original.speciality ? (
            <Badge variant="outline" className="font-bold bg-muted/30 border-border/60 px-2 py-0.5 rounded-lg text-[10px] uppercase">
              {row.original.speciality.name}
            </Badge>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          )
        ),
      },
      {
        accessorKey: "city",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("ADMIN_VALIDATION.WORKERS.TABLE.LOCATION")} />
        ),
        cell: ({ row }) =>
          row.getValue("city") ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 opacity-60" />
              {row.getValue("city")}
            </div>
          ) : (
            <span className="text-muted-foreground/50">—</span>
          ),
      },
      {
        accessorKey: "documents",
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={t("ADMIN_VALIDATION.WORKERS.TABLE.DOCS")} />
        ),
        cell: ({ row }) => {
          const count = row.original.documents?.length || 0;
          return (
            <div className={`flex items-center gap-2 text-xs font-black ${count > 0 ? 'text-primary' : 'text-muted-foreground/40'}`}>
              <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center", count > 0 ? "bg-primary/10" : "bg-muted")}>
                <FileText className="h-3.5 w-3.5" />
              </div>
              {count}
            </div>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: ({ column }) => (
          <DataTableColumnHeader title={t("ADMIN_VALIDATION.WORKERS.TABLE.REGISTERED")} column={column} />
        ),
        cell: ({ row }) => {
          const dateStr = row.getValue("createdAt") as string;
          return (
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground/80">
              <Calendar className="h-3.5 w-3.5 opacity-60" />
              {format(new Date(dateStr), "MMM d, yyyy")}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <DataTableColumnHeader title={t("ADMIN_VALIDATION.WORKERS.TABLE.STATUS")} column={column} />
        ),
        cell: ({ row }) => {
          const status = row.getValue("status") as string;
          return <StatusBadge status={status as any} className="text-[10px] font-bold uppercase tracking-wider h-6" />;
        },
      },
      {
        id: "actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReview(row.original)}
            className="h-9 px-4 text-primary font-bold hover:bg-primary/10 rounded-xl group"
          >
            <Eye className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
            {t("ADMIN_VALIDATION.DOCUMENTS.CARD.VIEW")}
          </Button>
        ),
      },
    ],
    [onReview, t]
  );

  return (
    <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <DataTable
        columns={columns}
        data={workers}
        isLoading={isLoading}
        enableGlobalFilter={false}
        enablePagination
        pageSize={10}
        emptyIcon={User}
        emptyTitle={t("ADMIN_VALIDATION.WORKERS.EMPTY_TITLE")}
        emptyDescription={t("ADMIN_VALIDATION.WORKERS.EMPTY_DESC")}
      />
    </div>
  );
}
