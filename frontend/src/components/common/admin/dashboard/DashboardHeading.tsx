import { Download, UserPlus } from "lucide-react";

export function DashboardHeading() {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-3xl font-semibold tracking-tight">
          Dashboard Overview
        </h2>
        <p className="text-muted-foreground text-sm">
          Live status of missions, users and activity
        </p>
      </div>

      <div className="flex gap-3">
        <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted/60 transition-colors shadow-sm">
          <Download className="h-4 w-4" />
          Export Report
        </button>

        <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors">
          <UserPlus className="h-4 w-4" />
          Invite User
        </button>
      </div>
    </div>
  );
}
