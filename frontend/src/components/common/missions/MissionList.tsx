import { DataTable } from "@/components/common/DataTable";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function MissionList({
  view,
  filtered,
  columns,
  isLoading,
  renderGridItem,
}: any) {
  /* --------------------- TABLE VIEW LOADING --------------------- */
  if (isLoading && view === "table") {
    return (
      <Card className="rounded-2xl p-4 shadow-card border bg-card">
        <div className="space-y-4">
          {/* Table header skeleton */}
          <div className="grid grid-cols-5 gap-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-12" />
          </div>

          {/* Table rows skeleton */}
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="grid grid-cols-5 gap-4 items-center py-2 border-t"
            >
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  /* --------------------- GRID LOADING --------------------- */
  if (isLoading && view === "grid") {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="rounded-2xl p-5 space-y-3 border bg-card shadow-card"
          >
            <div className="flex justify-between">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14" />
            </div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-32" />
            <div className="mt-4 flex justify-between border-t pt-4">
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  /* --------------------- REAL DATA --------------------- */
  return view === "table" ? (
    <DataTable data={filtered} columns={columns} className="bg-white" />
  ) : (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(renderGridItem)}
    </div>
  );
}
