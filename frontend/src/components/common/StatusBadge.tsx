import { Badge, badgeVariants } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { VariantProps } from "class-variance-authority"

// Status types from the application
type ApplicationStatus = "SUBMITTED" | "REJECTED" | "ACCEPTED"
type AssignmentStatus = "ACTIVE" | "ONGOING" | "COMPLETED" | "CANCELLED"
type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED"
type WorkerStatus = "PENDING" | "VERIFIED" | "REJECTED"
type MissionStatus = "OPEN" | "ONGOING" | "CLOSED" | "CANCELLED"
type DocumentStatus = "PENDING" | "APPROVED" | "REJECTED"

export type StatusType =
    | ApplicationStatus
    | AssignmentStatus
    | PaymentStatus
    | WorkerStatus
    | MissionStatus
    | DocumentStatus

interface StatusConfig {
    label: string
    variant: VariantProps<typeof badgeVariants>["variant"]
    className?: string
}

const statusConfigs: Record<StatusType, StatusConfig> = {
    // Application statuses
    SUBMITTED: { label: "Submitted", variant: "secondary", className: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800" },
    REJECTED: { label: "Rejected", variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },
    ACCEPTED: { label: "Accepted", variant: "success", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },

    // Assignment statuses
    ACTIVE: { label: "Active", variant: "default", className: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800" },
    ONGOING: { label: "Ongoing", variant: "warning", className: "bg-amber-100 text-amber-700 hover:bg-amber-200 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800" },
    COMPLETED: { label: "Completed", variant: "success", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
    CANCELLED: { label: "Cancelled", variant: "destructive", className: "bg-rose-100 text-rose-700 hover:bg-rose-200 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800" },

    // Payment statuses
    PENDING: { label: "Pending", variant: "warning", className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800" },
    FAILED: { label: "Failed", variant: "destructive", className: "bg-red-100 text-red-700 hover:bg-red-200 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800" },

    // Worker statuses
    VERIFIED: { label: "Verified", variant: "success", className: "bg-green-100 text-green-700 hover:bg-green-200 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800" },

    // Mission statuses
    OPEN: { label: "Open", variant: "secondary", className: "bg-sky-100 text-sky-700 hover:bg-sky-200 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800" },
    CLOSED: { label: "Closed", variant: "secondary", className: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700" },

    // Document statuses
    APPROVED: { label: "Approved", variant: "success", className: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800" },
}

interface StatusBadgeProps {
    status: StatusType
    className?: string
    hideText?: boolean
}

export function StatusBadge({ status, className, hideText = false }: StatusBadgeProps) {
    const config = statusConfigs[status]

    if (!config) {
        return (
            <Badge variant="outline" className={className}>
                {hideText ? "" : status}
            </Badge>
        )
    }

    if (hideText) {
        // Return just a colored circle
        return (
            <div
                className={cn("rounded-full transition-colors", config.className, className)}
                title={config.label}
            />
        )
    }

    return (
        <Badge
            variant={config.variant}
            className={cn("border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", config.className, className)}
        >
            {config.label}
        </Badge>
    )
}

