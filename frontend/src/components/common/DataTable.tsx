import { useState, useMemo } from "react"
import {
    useReactTable,
    getCoreRowModel,
    getSortedRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    flexRender,
    type ColumnDef,
    type SortingState,
    type ColumnFiltersState,
    type Column,
    type Table as TanStackTable,
} from "@tanstack/react-table"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "./EmptyState"
import { cn } from "@/lib/utils"
import {
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Search,
    X,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Column header component with sorting
interface DataTableColumnHeaderProps<TData, TValue> {
    column: Column<TData, TValue>
    title: string
    className?: string
}

export function DataTableColumnHeader<TData, TValue>({
    column,
    title,
    className,
}: DataTableColumnHeaderProps<TData, TValue>) {
    if (!column.getCanSort()) {
        return <div className={cn(className)}>{title}</div>
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            className={cn("-ml-3 h-8 data-[state=open]:bg-primary/10", className)}
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
            <span>{title}</span>
            {column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
            ) : column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
            ) : (
                <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
            )}
        </Button>
    )
}


// Column filter input component
interface DataTableColumnFilterProps<TData> {
    column: Column<TData, unknown>
    placeholder?: string
}

function DataTableColumnFilter<TData>({
    column,
    placeholder = "Filter...",
}: DataTableColumnFilterProps<TData>) {
    const columnFilterValue = column.getFilterValue() as string

    return (
        <div className="relative">
            <Input
                type="text"
                value={columnFilterValue ?? ""}
                onChange={(e) => column.setFilterValue(e.target.value)}
                placeholder={placeholder}
                className="h-8 w-full text-xs"
            />
            {columnFilterValue && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-8 w-8"
                    onClick={() => column.setFilterValue("")}
                >
                    <X className="h-3 w-3" />
                </Button>
            )}
        </div>
    )
}

// Pagination component for DataTable
interface DataTablePaginationProps<TData> {
    table: TanStackTable<TData>
    pageSizeOptions?: number[]
}

function DataTablePagination<TData>({
    table,
    pageSizeOptions = [10, 20, 30, 50],
}: DataTablePaginationProps<TData>) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <select
                    value={table.getState().pagination.pageSize}
                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                    Page {table.getState().pagination.pageIndex + 1} of{" "}
                    {table.getPageCount() || 1}
                </span>

                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.setPageIndex(0)}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to first page"
                    >
                        <ChevronsLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        aria-label="Go to previous page"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        aria-label="Go to next page"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                        disabled={!table.getCanNextPage()}
                        aria-label="Go to last page"
                    >
                        <ChevronsRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}


// Main DataTable component props
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean

    // Sorting
    enableSorting?: boolean
    initialSorting?: SortingState

    // Filtering
    enableFiltering?: boolean
    enableGlobalFilter?: boolean
    globalFilterPlaceholder?: string

    // Pagination - can be controlled externally or internally
    enablePagination?: boolean
    pageSize?: number
    pageSizeOptions?: number[]
    // External pagination control (for server-side pagination)
    manualPagination?: boolean
    pageCount?: number

    // Empty state
    emptyIcon?: LucideIcon
    emptyTitle?: string
    emptyDescription?: string
    emptyAction?: React.ReactNode

    // Styling
    className?: string
    tableClassName?: string

    // Skeleton rows count
    skeletonRowCount?: number
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading = false,
    enableSorting = true,
    initialSorting = [],
    enableFiltering = false,
    enableGlobalFilter = false,
    globalFilterPlaceholder = "Search all columns...",
    enablePagination = true,
    pageSize = 10,
    pageSizeOptions = [10, 20, 30, 50],
    manualPagination = false,
    pageCount,
    emptyIcon,
    emptyTitle = "No data found",
    emptyDescription,
    emptyAction,
    className,
    tableClassName,
    skeletonRowCount = 5,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>(initialSorting)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState("")

    // Memoize columns to prevent unnecessary re-renders
    const memoizedColumns = useMemo(() => columns, [columns])

    const table = useReactTable({
        data,
        columns: memoizedColumns,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getFilteredRowModel: enableFiltering || enableGlobalFilter ? getFilteredRowModel() : undefined,
        getPaginationRowModel: enablePagination && !manualPagination ? getPaginationRowModel() : undefined,
        manualPagination,
        pageCount: manualPagination ? pageCount : undefined,
        initialState: {
            pagination: {
                pageSize,
            },
        },
    })

    // Note: For external pagination control when manualPagination is true,
    // the parent component handles data fetching based on pagination state.


    // Loading state with skeleton
    if (isLoading) {
        return (
            <div className={cn("space-y-4", className)}>
                {/* Global filter skeleton */}
                {enableGlobalFilter && (
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-9 w-64" />
                    </div>
                )}

                <div className="rounded-md border">
                    <Table className={tableClassName}>
                        <TableHeader>
                            <TableRow>
                                {columns.map((_column, index) => (
                                    <TableHead key={index}>
                                        <Skeleton className="h-4 w-20" />
                                    </TableHead>
                                ))}
                            </TableRow>
                            {/* Column filter skeleton */}
                            {enableFiltering && (
                                <TableRow className="hover:bg-transparent">
                                    {columns.map((_, index) => (
                                        <TableHead key={`filter-${index}`} className="py-2">
                                            <Skeleton className="h-8 w-full" />
                                        </TableHead>
                                    ))}
                                </TableRow>
                            )}
                        </TableHeader>
                        <TableBody>
                            {Array.from({ length: skeletonRowCount }).map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {columns.map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-5 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination skeleton */}
                {enablePagination && (
                    <div className="flex items-center justify-between px-2">
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-8 w-48" />
                    </div>
                )}
            </div>
        )
    }

    // Empty state
    if (data.length === 0) {
        return (
            <div className={cn("space-y-4", className)}>
                {/* Show global filter even when empty */}
                {enableGlobalFilter && (
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder={globalFilterPlaceholder}
                                value={globalFilter}
                                onChange={(e) => setGlobalFilter(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                )}
                <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyDescription}
                    action={emptyAction}
                />
            </div>
        )
    }


    // Check if filtered results are empty
    const filteredRowCount = table.getFilteredRowModel().rows.length
    const hasActiveFilters = globalFilter || columnFilters.length > 0

    return (
        <div className={cn("space-y-4", className)}>
            {/* Global filter */}
            {enableGlobalFilter && (
                <div className="flex items-center gap-2">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={globalFilterPlaceholder}
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            className="pl-9"
                        />
                        {globalFilter && (
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full w-9"
                                onClick={() => setGlobalFilter("")}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setGlobalFilter("")
                                setColumnFilters([])
                            }}
                            className="text-muted-foreground"
                        >
                            Clear filters
                        </Button>
                    )}
                </div>
            )}

            <div className="rounded-md border">
                <Table className={tableClassName}>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="whitespace-nowrap">
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
                        {/* Column filters row */}
                        {enableFiltering && (
                            <TableRow className="hover:bg-transparent">
                                {table.getHeaderGroups()[0]?.headers.map((header) => (
                                    <TableHead key={`filter-${header.id}`} className="py-2">
                                        {header.column.getCanFilter() ? (
                                            <DataTableColumnFilter
                                                column={header.column}
                                                placeholder={`Filter ${typeof header.column.columnDef.header === "string"
                                                    ? header.column.columnDef.header
                                                    : ""
                                                    }...`}
                                            />
                                        ) : null}
                                    </TableHead>
                                ))}
                            </TableRow>
                        )}
                    </TableHeader>
                    <TableBody>
                        {filteredRowCount === 0 && hasActiveFilters ? (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No results match your filters.
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {enablePagination && (
                <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
            )}
        </div>
    )
}

// Re-export types for convenience
export type { ColumnDef, SortingState, ColumnFiltersState }
