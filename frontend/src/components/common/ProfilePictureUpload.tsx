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
    size?: "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl";
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
        <div className={cn("flex flex-col items-center gap-2", className)}>
            <div className="relative group p-1 rounded-full border-2 border-dashed border-muted-foreground/20 hover:border-primary/50 transition-colors">
                {/* Avatar */}
                <UserAvatar
                    src={displayImage}
                    name={name}
                    size={size}
                    className={cn(
                        "transition-opacity duration-300 ring-4 ring-background",
                        isProcessing && "opacity-50"
                    )}
                />

                {/* Edit Button (Bottom Right) */}
                {!hasPreview && !isProcessing && (
                    <button
                        type="button"
                        onClick={triggerFileSelect}
                        className="absolute bottom-1 right-1 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        aria-label="Change profile picture"
                    >
                        <Camera className="h-4 w-4" />
                    </button>
                )}

                {/* Loading Overlay */}
                {isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full backdrop-blur-sm z-20">
                        <Loader2 className="h-8 w-8 text-white animate-spin" />
                    </div>
                )}

                {/* Preview Actions Overlay */}
                {hasPreview && !isProcessing && (
                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 rounded-full backdrop-blur-sm z-20 animate-in fade-in zoom-in-95 duration-200">
                        <Button
                            type="button"
                            size="icon"
                            variant="default"
                            className="h-9 w-9 rounded-full bg-green-600 hover:bg-green-700 text-white border-none"
                            onClick={handleUpload}
                            title="Save"
                        >
                            <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                            type="button"
                            size="icon"
                            variant="destructive"
                            className="h-9 w-9 rounded-full"
                            onClick={handleCancel}
                            title="Cancel"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>

            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_MIME_TYPES.join(",")}
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Error Message */}
            {error && (
                <p className="text-sm text-destructive font-medium animate-in slide-in-from-top-1">
                    {error}
                </p>
            )}

            {/* Delete Option (only if image exists and not in preview) */}
            {currentImage && !hasPreview && !isProcessing && onDelete && (
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive bg-destructive/10 hover:bg-destructive/10 text-xs h-7"
                    onClick={handleDelete}
                >
                    Remove photo
                </Button>
            )}
        </div>
    );
}
