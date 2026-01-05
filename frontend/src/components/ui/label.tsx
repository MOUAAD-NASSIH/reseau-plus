import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const labelVariants = cva(
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 transition-colors duration-(--transition-fast)"
)

interface LabelProps extends React.ComponentProps<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
    required?: boolean;
}

function Label({
    className,
    required,
    children,
    ...props
}: LabelProps) {
    return (
        <LabelPrimitive.Root
            data-slot="label"
            className={cn(labelVariants(), className)}
            {...props}
        >
            {children}
            {required && (
                <span className="text-destructive ml-0.5" aria-hidden="true">*</span>
            )}
        </LabelPrimitive.Root>
    )
}

export { Label }
