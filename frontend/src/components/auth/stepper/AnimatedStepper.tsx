import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { shouldReduceMotion } from "@/lib/animations";

interface Step {
    id: string | number;
    label: string;
    description?: string;
}

interface AnimatedStepperProps {
    steps: Step[];
    currentStep: number;
}

export function AnimatedStepper({ steps, currentStep }: AnimatedStepperProps) {
    const reduceMotion = shouldReduceMotion();

    return (
        <div className="space-y-4">
            {steps.map((step, index) => {
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                    <motion.div
                        key={step.id}
                        className="flex items-start gap-4"
                        initial={reduceMotion ? {} : { opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Step indicator */}
                        <div className="relative flex flex-col items-center">
                            <motion.div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    "border-2 transition-colors duration-300",
                                    isCompleted && "bg-primary border-primary",
                                    isCurrent && "border-primary bg-primary/10",
                                    !isCompleted && !isCurrent && "border-muted-foreground/30 bg-muted"
                                )}
                                animate={
                                    reduceMotion
                                        ? {}
                                        : {
                                            scale: isCurrent ? [1, 1.1, 1] : 1,
                                        }
                                }
                                transition={{
                                    duration: 0.5,
                                    repeat: isCurrent ? Infinity : 0,
                                    repeatDelay: 2,
                                }}
                            >
                                {isCompleted ? (
                                    <motion.div
                                        initial={reduceMotion ? {} : { scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <Check className="w-5 h-5 text-primary-foreground" />
                                    </motion.div>
                                ) : (
                                    <span
                                        className={cn(
                                            "text-sm font-semibold",
                                            isCurrent ? "text-primary" : "text-muted-foreground"
                                        )}
                                    >
                                        {index + 1}
                                    </span>
                                )}
                            </motion.div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <motion.div
                                    className={cn(
                                        "w-0.5 h-8 mt-2",
                                        isCompleted ? "bg-primary" : "bg-muted-foreground/30"
                                    )}
                                    initial={reduceMotion ? {} : { scaleY: 0 }}
                                    animate={{ scaleY: 1 }}
                                    transition={{ delay: index * 0.1 + 0.2 }}
                                    style={{ originY: 0 }}
                                />
                            )}
                        </div>

                        {/* Step content */}
                        <div className="pt-1.5">
                            <motion.h3
                                className={cn(
                                    "font-medium",
                                    isCurrent && "text-primary",
                                    isCompleted && "text-foreground",
                                    !isCurrent && !isCompleted && "text-muted-foreground"
                                )}
                            >
                                {step.label}
                            </motion.h3>
                            {step.description && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                    {step.description}
                                </p>
                            )}
                            {isCurrent && (
                                <motion.p
                                    className="text-xs text-muted-foreground mt-1"
                                    initial={reduceMotion ? {} : { opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    Step {index + 1} of {steps.length}
                                </motion.p>
                            )}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

export default AnimatedStepper;
