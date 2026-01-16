import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MissionSkeletonCard() {
  return (
    <Card className="rounded-2xl border bg-card p-5 space-y-3 shadow-sm">
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-12" />
      </div>

      <Skeleton className="h-5 w-40" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />

      <div className="space-y-2 mt-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-36" />
      </div>

      <div className="pt-4 border-t mt-3">
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  );
}
