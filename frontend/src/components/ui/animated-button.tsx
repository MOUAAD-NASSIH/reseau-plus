import { forwardRef, type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { shouldReduceMotion } from "@/lib/animations";
import { Loader2 } from "lucide-react";

interface AnimatedButtonProps {
    variant?: "primary" | "secondary" | "outline" | "ghost";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    className?: string;
    children?: ReactNode;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    "aria-label"?: string;
}

const variants = {
    primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90",
    outline:
        "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
};

const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-6 text-base",
};

export const AnimatedButton = forwardRef<
    HTMLButtonElement,
    AnimatedButtonProps
>(
    (
        {
            variant = "primary",
            size = "md",
            isLoading,
            leftIcon,
            rightIcon,
            className,
            children,
            disabled,
            type = "button",
            onClick,
            "aria-label": ariaLabel,
        },
        ref
    ) => {
        const reduceMotion = shouldReduceMotion();
        const isDisabled = disabled || isLoading;

        const motionProps = reduceMotion
            ? {}
            : {
                whileHover: isDisabled ? {} : { scale: 1.02 },
                whileTap: isDisabled ? {} : { scale: 0.98 },
                transition: { type: "spring" as const, stiffness: 400, damping: 17 },
            };

        return (
            <motion.button
                ref={ref}
                type={type}
                className={cn(
                    "inline-flex items-center justify-center gap-2 rounded-lg font-medium",
                    "transition-colors focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-ring focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    variants[variant],
                    sizes[size],
                    className
                )}
                disabled={isDisabled}
                onClick={onClick}
                aria-label={ariaLabel}
                {...motionProps}
            >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
                {children}
                {!isLoading && rightIcon}
            </motion.button>
        );
    }
);

AnimatedButton.displayName = "AnimatedButton";
