import { Link } from "react-router";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KPICardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        direction: "up" | "down" | "neutral";
        label?: string;
    };
    isLoading?: boolean;
    variant?: "default" | "success" | "warning" | "info";
    href?: string;
}

const variantStyles = {
    default: {
        iconBg: "bg-muted",
        iconColor: "text-muted-foreground",
    },
    success: {
        iconBg: "bg-success/10",
        iconColor: "text-success",
    },
    warning: {
        iconBg: "bg-warning/10",
        iconColor: "text-warning",
    },
    info: {
        iconBg: "bg-info/10",
        iconColor: "text-info",
    },
};

const trendStyles = {
    up: {
        icon: TrendingUp,
        color: "text-success",
    },
    down: {
        icon: TrendingDown,
        color: "text-destructive",
    },
    neutral: {
        icon: Minus,
        color: "text-muted-foreground",
    },
};

export function KPICard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    isLoading = false,
    variant = "default",
    href,
}: KPICardProps) {
    const styles = variantStyles[variant];

    const content = (
        <Card className={cn("kpi-card", href && "cursor-pointer")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <div className={cn("p-2 rounded-md", styles.iconBg)}>
                    <Icon className={cn("h-4 w-4", styles.iconColor)} />
                </div>
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-20" />
                        {description && <Skeleton className="h-4 w-32" />}
                    </div>
                ) : (
                    <>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold">{value}</span>
                            {trend && (
                                <TrendIndicator
                                    value={trend.value}
                                    direction={trend.direction}
                                    label={trend.label}
                                />
                            )}
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground mt-1">{description}</p>
                        )}
                        {href && (
                            <div className="flex items-center text-xs text-primary mt-2 font-medium">
                                View details
                                <ArrowRight className="ml-1 h-3 w-3" />
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );

    if (href) {
        return <Link to={href}>{content}</Link>;
    }

    return content;
}

function TrendIndicator({
    value,
    direction,
    label,
}: {
    value: number;
    direction: "up" | "down" | "neutral";
    label?: string;
}) {
    const { icon: TrendIcon, color } = trendStyles[direction];

    return (
        <span className={cn("flex items-center text-xs font-medium", color)}>
            <TrendIcon className="h-3 w-3 mr-0.5" />
            {value > 0 ? "+" : ""}
            {value}%
            {label && <span className="ml-1 text-muted-foreground">{label}</span>}
        </span>
    );
}

export default KPICard;
