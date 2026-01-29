import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, XCircle, CheckCircle2 } from "lucide-react";

interface MissionStatusTagsProps {
    status: string;
    id: number;
    urgency: string;
    t: (key: string, options?: any) => string;
}

export function MissionStatusTags({ status, id, urgency, t }: MissionStatusTagsProps) {
    // Status configuration
    const getStatusConfig = (status: string) => {
        switch (status.toUpperCase()) {
            case "OPEN":
                return {
                    label: t("MISSION_DETAILS.STATUS.OPEN"),
                    icon: "dot",
                    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
                    textColor: "text-emerald-700 dark:text-emerald-400",
                    borderColor: "border-emerald-500/20",
                    dotColor: "bg-emerald-600 dark:bg-emerald-400"
                };
            case "ONGOING":
            case "IN_PROGRESS":
                return {
                    label: t("MISSION_DETAILS.STATUS.ONGOING"),
                    icon: Clock,
                    bgColor: "bg-blue-500/10 dark:bg-blue-500/15",
                    textColor: "text-blue-700 dark:text-blue-400",
                    borderColor: "border-blue-500/20"
                };
            case "CLOSED":
                return {
                    label: t("MISSION_DETAILS.STATUS.CLOSED"),
                    icon: XCircle,
                    bgColor: "bg-muted/60 dark:bg-muted/30",
                    textColor: "text-muted-foreground",
                    borderColor: "border-border/50"
                };
            case "CANCELLED":
                return {
                    label: t("MISSION_DETAILS.STATUS.CANCELLED"),
                    icon: AlertTriangle,
                    bgColor: "bg-destructive/10 dark:bg-destructive/15",
                    textColor: "text-destructive",
                    borderColor: "border-destructive/20"
                };
            default:
                return {
                    label: status,
                    icon: CheckCircle2,
                    bgColor: "bg-primary/10",
                    textColor: "text-primary",
                    borderColor: "border-primary/20"
                };
        }
    };

    // Urgency configuration
    const getUrgencyConfig = (urgency: string) => {
        switch (urgency.toUpperCase()) {
            case "HIGH":
                return {
                    label: t("MISSION_DETAILS.URGENCY.HIGH"),
                    icon: AlertTriangle,
                    bgColor: "bg-destructive/10 dark:bg-destructive/15",
                    textColor: "text-destructive",
                    borderColor: "border-destructive/30"
                };
            case "MEDIUM":
                return {
                    label: t("MISSION_DETAILS.URGENCY.MEDIUM"),
                    icon: "dot",
                    bgColor: "bg-orange-500/10 dark:bg-orange-500/15",
                    textColor: "text-orange-700 dark:text-orange-400",
                    borderColor: "border-orange-500/20",
                    dotColor: "bg-orange-600 dark:bg-orange-400"
                };
            case "LOW":
                return {
                    label: t("MISSION_DETAILS.URGENCY.LOW"),
                    icon: CheckCircle2,
                    bgColor: "bg-emerald-500/10 dark:bg-emerald-500/15",
                    textColor: "text-emerald-700 dark:text-emerald-400",
                    borderColor: "border-emerald-500/20"
                };
            default:
                return {
                    label: urgency,
                    icon: "dot",
                    bgColor: "bg-muted/50",
                    textColor: "text-muted-foreground",
                    borderColor: "border-border/40",
                    dotColor: "bg-muted-foreground/50"
                };
        }
    };

    const statusConfig = getStatusConfig(status);
    const urgencyConfig = getUrgencyConfig(urgency);

    const renderIcon = (config: any) => {
        if (config.icon === "dot") {
            return <div className={cn("h-1.5 w-1.5 rounded-full shrink-0", config.dotColor)} />;
        }
        const Icon = config.icon;
        return <Icon className="h-3 w-3 shrink-0" />;
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Mission ID Badge */}
            <Badge variant="outline" className="rounded-full font-mono text-[11px] bg-muted/30 border-border/40 text-muted-foreground/70 px-2 py-0.5">
                ID: MSN-{id}
            </Badge>

            {/* Status Pill */}
            <Badge
                variant="outline"
                className={cn(
                    "rounded-full font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1.5 transition-all duration-300 cursor-default select-none border",
                    statusConfig.bgColor,
                    statusConfig.textColor,
                    statusConfig.borderColor,
                    "hover:scale-[1.03] hover:shadow-sm"
                )}
            >
                {renderIcon(statusConfig)}
                <span>{statusConfig.label}</span>
            </Badge>

            {/* Urgency Pill */}
            <Badge
                variant="outline"
                className={cn(
                    "rounded-full font-bold text-[11px] px-2.5 py-0.5 flex items-center gap-1.5 transition-all duration-300 cursor-default select-none border",
                    urgencyConfig.bgColor,
                    urgencyConfig.textColor,
                    urgencyConfig.borderColor,
                    "hover:scale-[1.03] hover:shadow-sm"
                )}
            >
                {renderIcon(urgencyConfig)}
                <span>{urgencyConfig.label}</span>
            </Badge>
        </div>
    );
}
