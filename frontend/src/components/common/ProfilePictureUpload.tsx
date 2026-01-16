/**
 * ProfilePictureUpload Component
 * Handles profile picture selection, preview, and upload
 */

import { useState, useRef, useCallback } from "react";
import { Upload, X, Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Constants matching backend validation
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export interface ProfilePictureUploadProps {
    /** Current profile picture URL */
    currentImage?: string | null;
    /** User's name for avatar fallback */
    name: string;
    /** Callback when upload is triggered */
    onUpload: (file: File) => Promise<void>;
    /** Callback when delete is triggered */
    onDelete?: () => Promise<void>;
    /** Whether upload is in progress */
    isLoading?: boolean;
    /** Whether delete is in progress */
    isDeleting?: boolean;
    /** Additional CSS classes */
    className?: string;
    /** Size of the avatar preview */
    size?: "md" | "lg" | "xl";
}

/**
 * Validate file before upload
 */
function validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return {
            valid: false,
            error: "Invalid file type. Please upload a JPEG, PNG, or WebP image.",
        };
    }

    if (file.size > MAX_FILE_SIZE) {
        return {
            valid: false,
            error: "File size exceeds 5MB limit. Please choose a smaller image.",
        };
    }

    return { valid: true };
}

/**
 * ProfilePictureUpload component
 * Provides file selection with preview and upload functionality
 */
export function ProfilePictureUpload({
    currentImage,
    name,
    onUpload,
    onDelete,
    isLoading = false,
    isDeleting = false,
    className,
    size = "xl",
}: ProfilePictureUploadProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const isProcessing = isLoading || isDeleting;

    /**
     * Handle file selection
     */
    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clear previous state
        setError(null);

        // Validate file
        const validation = validateFile(file);
        if (!validation.valid) {
            setError(validation.error || "Invalid file");
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        // Create preview URL
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setSelectedFile(file);
    }, []);

    /**
     * Handle upload confirmation
     */
    const handleUpload = useCallback(async () => {
        if (!selectedFile) return;

        try {
            setError(null);
            await onUpload(selectedFile);

            // Clear preview on success
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(null);
            setSelectedFile(null);

            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to upload image";
            setError(errorMessage);
        }
    }, [selectedFile, onUpload, previewUrl]);

    /**
     * Cancel preview and reset
     */
    const handleCancel = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setSelectedFile(null);
        setError(null);

        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    }, [previewUrl]);

    /**
     * Handle delete
     */
    const handleDelete = useCallback(async () => {
        if (!onDelete || !currentImage) return;

        try {
            setError(null);
            await onDelete();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to delete image";
            setError(errorMessage);
        }
    }, [onDelete, currentImage]);

    /**
     * Trigger file input click
     */
    const triggerFileSelect = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    // Determine which image to display
    const displayImage = previewUrl || currentImage;
    const hasPreview = !!previewUrl;

    return (
        <div className={cn("flex flex-col items-center gap-4", className)}>
            {/* Avatar with overlay */}
            <div className="relative group">
                <UserAvatar
                    src={displayImage}
                    name={name}
                    size={size}
                    className={cn(
                        "transition-opacity",
                        isProcessing && "opacity-50"
                    )}
                />

                {/* Overlay for changing picture */}
                {!hasPreview && !isProcessing && (
                    <button
                        type="button"
                        onClick={triggerFileSelect}
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        aria-label="Change profile picture"
                    >
                        <Camera className="h-6 w-6 text-white" />
                    </button>
                )}

                {/* Loading overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                        <Loader2 className="h-6 w-6 text-white animate-spin" />
                    </div>
                )}
            </div>

            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_MIME_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                aria-label="Select profile picture"
            />

            {/* Action buttons */}
            <div className="flex flex-col items-center gap-2">
                {hasPreview ? (
                    // Preview mode - show confirm/cancel
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            onClick={handleUpload}
                            disabled={isProcessing}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Save
                                </>
                            )}
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={handleCancel}
                            disabled={isProcessing}
                        >
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </Button>
                    </div>
                ) : (
                    // Normal mode - show upload/delete
                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={triggerFileSelect}
                            disabled={isProcessing}
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            {currentImage ? "Change" : "Upload"}
                        </Button>
                        {currentImage && onDelete && (
                            <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={handleDelete}
                                disabled={isProcessing}
                                className="text-destructive hover:text-destructive"
                            >
                                {isDeleting ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <X className="h-4 w-4" />
                                )}
                            </Button>
                        )}
                    </div>
                )}

                {/* Helper text */}
                <p className="text-xs text-muted-foreground text-center">
                    JPEG, PNG, or WebP. Max 5MB.
                </p>

                {/* Error message */}
                {error && (
                    <p className="text-sm text-destructive text-center" role="alert">
                        {error}
                    </p>
                )}
            </div>
        </div>
    );
}
