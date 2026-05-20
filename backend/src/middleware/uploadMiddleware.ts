import multer from 'multer';
import { Request } from 'express';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

/**
 * Creates a Multer storage engine that uploads directly to Cloudinary
 * @param folder - The folder in Cloudinary where files will be stored
 * @param allowedFormats - Array of allowed file formats (e.g., ['jpg', 'png', 'pdf'])
 * @param maxSizeMB - Maximum file size in MB
 */

export const createCloudinaryUpload = (
    folder: string,
    allowedFormats: string[] = ['jpg', 'jpeg', 'png', 'pdf'],
    maxSizeMB: number = 10
) => {
    const storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: folder,
            allowed_formats: allowedFormats,
            resource_type: 'auto', // Automatically detect image/video/raw
            use_filename: true,
            unique_filename: true,
        } as Record<string, unknown>,
    });
    return multer({
        storage,
        limits: {
            fileSize: maxSizeMB * 1024 * 1024, // Convert MB to bytes
        },
        fileFilter: (_req, file, cb) => {
            // Check file extension
            const ext = file.originalname.split('.').pop()?.toLowerCase();
            const isAllowed = allowedFormats.includes(ext ?? '');

            if (isAllowed) {
                cb(null, true);
            } else {
                cb(new Error(`Invalid file type. Allowed: ${allowedFormats.join(', ')}`));
            }
        },
    });
};
// Export specific uploaders for different use cases
export const documentUpload = createCloudinaryUpload(
    'social-workers-network/documents',
    ['jpg', 'jpeg', 'png', 'pdf'],
    10 // 10MB
);
export const imageUpload = createCloudinaryUpload(
    'social-workers-network/images',
    ['jpg', 'jpeg', 'png', 'webp'],
    5 // 5MB
);

// Profile picture upload - uses memory storage so the service layer
// can access file.buffer for custom Cloudinary transformations (crop, gravity, etc.)
const ALLOWED_PROFILE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const profileFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_PROFILE_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP'));
    }
};

export const profileImageUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: profileFileFilter,
});