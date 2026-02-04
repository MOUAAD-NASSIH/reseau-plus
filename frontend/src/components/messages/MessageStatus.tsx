import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageStatusProps {
    status: "SENT" | "DELIVERED" | "READ";
    isOwnMessage: boolean;
    className?: string;
}

export function MessageStatus({ status, isOwnMessage, className }: MessageStatusProps) {
    if (!isOwnMessage) return null;

    return (
        <span className={cn("inline-flex items-center ml-1", className)}>
            {status === "SENT" && (
                <Check className="h-3 w-3 text-muted-foreground" />
            )}
            {status === "DELIVERED" && (
                <CheckCheck className="h-3 w-3 text-muted-foreground" />
            )}
            {status === "READ" && (
                <CheckCheck className="h-3 w-3 text-blue-500" />
            )}
        </span>
    );
}
