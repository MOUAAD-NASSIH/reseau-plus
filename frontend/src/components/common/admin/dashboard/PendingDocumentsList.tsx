import { ChevronRight } from "lucide-react";
import type { WorkerDocument } from "@/types/auth.types";

interface Props {
  docs: WorkerDocument[];
  isLoading: boolean;
}

export function PendingDocumentsList({ docs, isLoading }: Props) {
  return (
    <div className="bg-card rounded-xl border shadow-sm p-6">
      <h3 className="text-lg font-bold mb-4">Pending Documents</h3>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No documents pending 🎉</p>
      ) : (
        <div className="flex flex-col">
          {docs.slice(0, 5).map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted cursor-pointer transition"
            >
              <p className="font-medium text-sm truncate">
                {d.fileUrl.split("/").pop()}
              </p>

              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
