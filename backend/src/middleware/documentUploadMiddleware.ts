/**
 * Document Upload Middleware
 * Used for document uploads (ID, certifications, etc.) - NOT for profile pictures
 * Profile pictures should use profileUploadMiddleware.ts
 */

import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async () => {
        return {
            folder: 'social-workers-network/documents',
            allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'],
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
        };
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for documents
    },
    fileFilter: (req, file, cb) => {
        // Accept images and PDFs for documents
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed for documents.'));
        }
    }
});

export default upload;
