import { forwardRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { shouldReduceMotion } from "@/lib/animations";
import type { LucideIcon } from "lucide-react";

interface AnimatedInputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: LucideIcon;
    error?: string;
    helperText?: string;
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
    ({ label, icon: Icon, error, helperText, className, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const [hasValue, setHasValue] = useState(
            !!props.value || !!props.defaultValue
        );
        const reduceMotion = shouldReduceMotion();

        const isFloating = isFocused || hasValue;

        return (
            <div className="space-y-1.5">
                <div className="relative">
                    {/* Floating Label */}
                    <motion.label
                        className={cn(
                            "absolute pointer-events-none transition-colors z-10",
                            Icon ? "left-11" : "left-3",
                            isFloating
                                ? "text-xs -top-2.5 bg-background px-1 left-2"
                                : "text-sm text-muted-foreground top-3.5",
                            isFocused && "text-primary",
                            error && isFocused && "text-destructive"
                        )}
                        animate={
                            reduceMotion
                                ? {}
                                : {
                                    y: isFloating ? 0 : 0,
                                    scale: isFloating ? 0.85 : 1,
                                }
                        }
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                        {label}
                    </motion.label>

                    {/* Icon */}
                    {Icon && (
                        <Icon
                            className={cn(
                                "absolute left-3 top-3.5 h-5 w-5 transition-colors",
                                isFocused ? "text-primary" : "text-muted-foreground",
                                error && "text-destructive"
                            )}
                        />
                    )}

                    {/* Input */}
                    <input
                        ref={ref}
                        className={cn(
                            "w-full h-12 px-3 rounded-lg border bg-background",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
                            Icon && "pl-11",
                            error &&
                            "border-destructive focus:ring-destructive/20 focus:border-destructive",
                            className
                        )}
                        onFocus={(e) => {
                            setIsFocused(true);
                            props.onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            setHasValue(!!e.target.value);
                            props.onBlur?.(e);
                        }}
                        onChange={(e) => {
                            setHasValue(!!e.target.value);
                            props.onChange?.(e);
                        }}
                        {...props}
                    />

                    {/* Focus ring animation */}
                    <AnimatePresence>
                        {isFocused && !reduceMotion && (
                            <motion.div
                                className={cn(
                                    "absolute inset-0 rounded-lg border-2 pointer-events-none",
                                    error ? "border-destructive" : "border-primary"
                                )}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.15 }}
                            />
                        )}
                    </AnimatePresence>
                </div>

                {/* Error/Helper Text */}
                <AnimatePresence mode="wait">
                    {error ? (
                        <motion.p
                            key="error"
                            className="text-sm text-destructive flex items-center gap-1.5"
                            initial={reduceMotion ? {} : { opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={reduceMotion ? {} : { opacity: 0, y: -5 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="w-1 h-1 rounded-full bg-destructive" />
                            {error}
                        </motion.p>
                    ) : helperText ? (
                        <motion.p
                            key="helper"
                            className="text-xs text-muted-foreground"
                            initial={reduceMotion ? {} : { opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {helperText}
                        </motion.p>
                    ) : null}
                </AnimatePresence>
            </div>
        );
    }
);

AnimatedInput.displayName = "AnimatedInput";
