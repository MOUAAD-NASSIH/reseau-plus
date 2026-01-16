import type { Worker } from "@/types/auth.types";
import { ChevronRight } from "lucide-react";

interface Props {
  pendingWorkers: Worker[];
  isLoading: boolean;
}

export function PendingValidationList({ pendingWorkers, isLoading }: Props) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-bold mb-4">Pending Validation</h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : pendingWorkers.length === 0 ? (
        <p className="text-sm text-muted-foreground">No pending approvals 🎉</p>
      ) : (
        <div className="flex flex-col">
          {pendingWorkers.slice(0, 5).map((w) => (
            <div
              key={w.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer transition-colors"
            >
              <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold">
                {w.firstName[0]}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">
                  {w.firstName} {w.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {w.speciality?.name ?? "No speciality"}
                </p>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
