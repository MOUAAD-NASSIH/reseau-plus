import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MissionSkeletonCard } from "./MissionSkeletonCard";

export function MissionSkeletonList({ view }: { view: "grid" | "table" }) {
  // TABLE MODE
  if (view === "table") {
    return (
      <Card className="rounded-xl border p-4 shadow-sm">
        <div className="space-y-4">
          {/* Header skeleton */}
          <Skeleton className="h-5 w-32" />

          {/* Rows */}
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-4 sm:grid-cols-6 gap-4 items-center"
              >
                <Skeleton className="h-4 w-24 col-span-2" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-12 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  // GRID MODE
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <MissionSkeletonCard key={i} />
      ))}
    </div>
  );
}
