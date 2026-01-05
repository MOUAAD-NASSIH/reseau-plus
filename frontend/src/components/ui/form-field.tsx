import * as React from "react"
import { cn } from "@/lib/utils"
import { Label } from "./label"
import { AlertCircle } from "lucide-react"

interface FormFieldProps {
    children: React.ReactNode;
    label?: string;
    htmlFor?: string;
    error?: string;
    description?: string;
    required?: boolean;
    className?: string;
}

/**
 * FormField component provides consistent form field styling with:
 * - Label with optional required indicator
 * - Error message with icon and animation
 * - Helper/description text
 * - Consistent spacing
 */
function FormField({
    children,
    label,
    htmlFor,
    error,
    description,
    required,
    className,
}: FormFieldProps) {
    return (
        <div className={cn("space-y-2", className)}>
            {label && (
                <Label htmlFor={htmlFor} required={required}>
                    {label}
                </Label>
            )}
            {children}
            {error && (
                <p className="form-error" role="alert">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>{error}</span>
                </p>
            )}
            {description && !error && (
                <p className="form-helper">{description}</p>
            )}
        </div>
    )
}

interface FormSectionProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
    className?: string;
}

/**
 * FormSection component groups related form fields with:
 * - Section title
 * - Optional description
 * - Consistent spacing
 */
function FormSection({
    children,
    title,
    description,
    className,
}: FormSectionProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {(title || description) && (
                <div className="space-y-1">
                    {title && (
                        <h3 className="form-section-title">{title}</h3>
                    )}
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
            )}
            {children}
        </div>
    )
}

interface FormActionsProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * FormActions component provides consistent action button styling
 */
function FormActions({ children, className }: FormActionsProps) {
    return (
        <div className={cn("form-actions", className)}>
            {children}
        </div>
    )
}

export { FormField, FormSection, FormActions }
