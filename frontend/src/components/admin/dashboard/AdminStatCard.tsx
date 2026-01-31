import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface AdminStatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    iconColor?: string;
    description?: string;
    trend?: string;
    trendUp?: boolean;
    className?: string;
    isLoading?: boolean;
    onClick?: () => void;
}

export function AdminStatCard({
    title,
    value,
    icon,
    iconColor = "text-primary",
    description,
    trend,
    trendUp,
    className,
    isLoading = false,
    onClick
}: AdminStatCardProps) {
    if (isLoading) {
        return (
            <Card className={cn("border-none shadow-md bg-card/50", className)}>
                <CardContent className="p-6 space-y-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-32" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card
            className={cn(
                "relative overflow-hidden border-none shadow-md bg-card group transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                onClick && "cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {/* Background watermark icon */}
            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-500 pointer-events-none">
                {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                    className: cn("w-32 h-32 transform rotate-12 transition-transform duration-500 group-hover:rotate-6", iconColor)
                }) : null}
            </div>

            <CardContent className="p-6 relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className={cn("p-2.5 rounded-xl bg-background/50 backdrop-blur-sm shadow-sm ring-1 ring-black/5 dark:ring-white/10", iconColor)}>
                        {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ className?: string }>, {
                            className: "w-5 h-5"
                        }) : icon}
                    </div>

                    {trend && (
                        <Badge
                            variant={trendUp ? "default" : "destructive"}
                            className={cn(
                                "font-medium shadow-none border-0",
                                trendUp
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/20"
                                    : "bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/20"
                            )}
                        >
                            {trend}
                        </Badge>
                    )}
                </div>

                <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider font-spline">
                        {title}
                    </h3>
                    <div className="text-3xl font-bold tracking-tight text-foreground font-spline">
                        {value}
                    </div>
                </div>

                {description && (
                    <p className="mt-2 text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                        {description}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
