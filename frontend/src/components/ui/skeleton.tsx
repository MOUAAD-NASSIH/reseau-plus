import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { shouldReduceMotion } from "@/lib/animations";

interface SkeletonProps {
    className?: string;
    variant?: "default" | "circular" | "text";
}

function Skeleton({ className, variant = "default" }: SkeletonProps) {
    const reduceMotion = shouldReduceMotion();

    const baseClassName = cn(
        "rounded-md bg-muted",
        variant === "circular" && "rounded-full",
        variant === "text" && "h-4 rounded",
        className
    );

    if (reduceMotion) {
        return <div data-slot="skeleton" className={baseClassName} />;
    }

    return (
        <motion.div
            data-slot="skeleton"
            className={baseClassName}
            animate={{
                opacity: [0.5, 1, 0.5],
            }}
            transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        />
    );
}

function FormSkeleton() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-12 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
        </div>
    );
}

export { Skeleton, FormSkeleton };
