import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    flexRender,
    createColumnHelper,
    type SortingState,
} from "@tanstack/react-table";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import {
    ArrowUpDown,
    Eye,
    FileText,
    Building2,
    Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { fr, enUS } from "date-fns/locale";
import type { MissionAssignment } from "@/types/assignment.types";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminAssignmentsTableProps {
    data: MissionAssignment[];
    isLoading: boolean;
    onViewAssignment: (assignment: MissionAssignment) => void;
}

export function AdminAssignmentsTable({
    data,
    isLoading,
    onViewAssignment,
}: AdminAssignmentsTableProps) {
    const { t, i18n } = useTranslation();
    const [sorting, setSorting] = useState<SortingState>([]);
    const dateLocale = i18n.language === "fr" ? fr : enUS;

    const columnHelper = createColumnHelper<MissionAssignment>();

    const columns = [
        // Mission Column
        columnHelper.accessor("mission.title", {
            header: ({ column }) => {
                return (
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                        className="-ml-4 h-8 data-[state=open]:bg-accent"
                    >
                        {t("ASSIGNMENTS_OVERVIEW.TABLE.COLUMNS.MISSION")}
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                );
            },
            cell: ({ row }) => {
                const mission = row.original.mission;
                return (
                    <div className="flex flex-col max-w-[200px] gap-1">
                        <span className="font-semibold truncate" title={mission?.title}>
                            {mission?.title}
                        </span>
                        <span className="text-xs text-muted-foreground truncate flex items-center gap-1">
                            <span className="font-mono text-[10px] bg-muted px-1 rounded-sm">#{row.original.id}</span>
                        </span>
                    </div>
                );
            },
        }),

        // Institution Column
        columnHelper.accessor("institution.institutionName", {
            header: t("ASSIGNMENTS_OVERVIEW.TABLE.COLUMNS.INSTITUTION"),
            cell: ({ row }) => {
                const institution = row.original.institution;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50 rounded-lg">
                            <AvatarImage src={institution?.logo || undefined} className="object-cover rounded-lg" />
                            <AvatarFallback className="rounded-lg bg-primary/5 text-primary text-xs font-bold">
                                <Building2 className="h-4 w-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate max-w-[150px]">{institution?.institutionName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{institution?.city || t("COMMON.N_A")}</span>
                        </div>
                    </div>
                );
            },
        }),

        // Worker Column
        columnHelper.accessor((row) => `${row.worker?.firstName} ${row.worker?.lastName}`, {
            id: "worker",
            header: t("ASSIGNMENTS_OVERVIEW.TABLE.COLUMNS.WORKER"),
            cell: ({ row }) => {
                const worker = row.original.worker;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border/50">
                            <AvatarImage src={worker?.profilePicture || worker?.user?.profilePicture || undefined} className="object-cover" />
                            <AvatarFallback className="bg-blue-500/10 text-blue-600 text-xs font-bold">
                                {worker?.firstName[0]}{worker?.lastName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium truncate max-w-[150px]">{worker?.firstName} {worker?.lastName}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[150px]">{worker?.user?.email}</span>
                        </div>
                    </div>
                );
            },
        }),

        // Status Column
        columnHelper.accessor("status", {
            header: t("ASSIGNMENTS_OVERVIEW.TABLE.COLUMNS.STATUS"),
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        }),

        // Actions Column
        columnHelper.display({
            id: "actions",
            header: t("ASSIGNMENTS_OVERVIEW.TABLE.COLUMNS.ACTIONS"),
            cell: ({ row }) => {
                return (
                    <div className="flex justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewAssignment(row.original)}
                            className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary rounded-full transition-colors"
                        >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View details</span>
                        </Button>
                    </div>
                );
            },
        }),
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        state: {
            sorting,
        },
    });

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg bg-card/50" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Desktop View (Table) */}
            <div className="hidden md:block rounded-2xl border border-border/40 shadow-sm bg-card/50 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/30 hover:bg-muted/30">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-border/40 hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-11 font-semibold text-muted-foreground">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="hover:bg-muted/30 border-border/40 transition-colors group cursor-pointer"
                                    onClick={() => onViewAssignment(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-64 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                        <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
                                            <FileText className="h-8 w-8 opacity-40" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-lg font-semibold text-foreground">
                                                {t("ASSIGNMENTS_OVERVIEW.TABLE.EMPTY_STATE.TITLE")}
                                            </p>
                                            <p className="text-sm max-w-sm mx-auto">
                                                {t("ASSIGNMENTS_OVERVIEW.TABLE.EMPTY_STATE.DESCRIPTION")}
                                            </p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>

                {table.getPageCount() > 1 && (
                    <div className="flex items-center justify-end space-x-2 py-4 px-4 border-t border-border/40 bg-muted/10">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-8 w-24"
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-8 w-24"
                        >
                            Next
                        </Button>
                    </div>
                )}
            </div>

            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
                {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => {
                        const assignment = row.original;
                        return (
                            <Card
                                key={row.id}
                                className="overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm active:scale-[0.98] transition-all duration-200"
                                onClick={() => onViewAssignment(assignment)}
                            >
                                <CardContent className="p-4 space-y-4">
                                    {/* Header: Status & ID */}
                                    <div className="flex items-center justify-between">
                                        <StatusBadge status={assignment.status} />
                                        <span className="font-mono text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                            #{assignment.id}
                                        </span>
                                    </div>

                                    {/* Mission Info */}
                                    <div className="space-y-1">
                                        <h4 className="font-bold text-foreground line-clamp-1">{assignment.mission?.title}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Building2 className="h-3 w-3" />
                                            <span className="line-clamp-1">{assignment.institution?.institutionName}</span>
                                        </div>
                                    </div>

                                    {/* Worker Info */}
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/30">
                                        <Avatar className="h-10 w-10 border border-border/50">
                                            <AvatarImage src={assignment.worker?.profilePicture || assignment.worker?.user?.profilePicture || undefined} />
                                            <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                                {assignment.worker?.firstName?.[0]}{assignment.worker?.lastName?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold truncate">
                                                {assignment.worker?.firstName} {assignment.worker?.lastName}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {assignment.worker?.user?.email}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Footer: Date & Action */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{format(new Date(assignment.assignedAt), "d MMM yyyy", { locale: dateLocale })}</span>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary hover:bg-primary/10">
                                            <Eye className="h-4 w-4 mr-1.5" />
                                            {t("COMMON.VIEW")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground bg-muted/10 rounded-2xl border border-dashed border-border/60">
                        <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center">
                            <FileText className="h-6 w-6 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">{t("ASSIGNMENTS_OVERVIEW.TABLE.EMPTY_STATE.DESCRIPTION")}</p>
                    </div>
                )}
            </div>
        </div>
    );
}
