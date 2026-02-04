import * as React from "react"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
    size?: "sm" | "default" | "lg";
    className?: string;
}

/**
 * LoadingSpinner component provides consistent loading indicator styling
 */
function LoadingSpinner({ size = "default", className }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: "h-3 w-3",
        default: "h-4 w-4",
        lg: "h-6 w-6",
    }

    return (
        <Loader2
            className={cn(
                "animate-spin text-muted-foreground",
                sizeClasses[size],
                className
            )}
        />
    )
}

interface LoadingOverlayProps {
    children?: React.ReactNode;
    className?: string;
}

/**
 * LoadingOverlay component provides a full overlay with loading indicator
 */
function LoadingOverlay({ children, className }: LoadingOverlayProps) {
    return (
        <div className={cn("loading-overlay", className)}>
            <div className="flex flex-col items-center gap-3">
                <LoadingSpinner size="lg" />
                {children && (
                    <p className="text-sm text-muted-foreground">{children}</p>
                )}
            </div>
        </div>
    )
}

interface LoadingDotsProps {
    className?: string;
}

/**
 * LoadingDots component provides an alternative loading indicator with bouncing dots
 */
function LoadingDots({ className }: LoadingDotsProps) {
    return (
        <div className={cn("loading-dots", className)}>
            <span />
            <span />
            <span />
        </div>
    )
}

export { LoadingSpinner, LoadingOverlay, LoadingDots }

