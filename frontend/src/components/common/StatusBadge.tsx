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
}

const statusConfigs: Record<StatusType, StatusConfig> = {
    // Application statuses
    SUBMITTED: { label: "Submitted", variant: "secondary" },
    REJECTED: { label: "Rejected", variant: "destructive" },
    ACCEPTED: { label: "Accepted", variant: "success" },

    // Assignment statuses
    ACTIVE: { label: "Active", variant: "default" },
    ONGOING: { label: "Ongoing", variant: "warning" },
    COMPLETED: { label: "Completed", variant: "success" },
    CANCELLED: { label: "Cancelled", variant: "destructive" },

    // Payment statuses
    PENDING: { label: "Pending", variant: "warning" },
    FAILED: { label: "Failed", variant: "destructive" },

    // Worker statuses
    VERIFIED: { label: "Verified", variant: "success" },

    // Mission statuses
    OPEN: { label: "Open", variant: "default" },
    CLOSED: { label: "Closed", variant: "secondary" },

    // Document statuses
    APPROVED: { label: "Approved", variant: "success" },
}

interface StatusBadgeProps {
    status: StatusType
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = statusConfigs[status]

    if (!config) {
        return (
            <Badge variant="outline" className={className}>
                {status}
            </Badge>
        )
    }

    return (
        <Badge
            variant={config.variant}
            className={cn(className)}
        >
            {config.label}
        </Badge>
    )
}
