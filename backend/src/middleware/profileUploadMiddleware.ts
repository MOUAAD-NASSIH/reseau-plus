/**
 * Profile Picture Upload Middleware
 * Uses memory storage for validation before Cloudinary upload
 */

import multer from 'multer';
import { Request } from 'express';

// Allowed MIME types for profile pictures
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Use memory storage so we can validate and then upload to Cloudinary
const storage = multer.memoryStorage();

// File filter for profile pictures
const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Allowed: JPEG, PNG, WebP'));
    }
};

// Create multer instance for profile picture uploads
const profileUpload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE
    },
    fileFilter
});

export default profileUpload;
