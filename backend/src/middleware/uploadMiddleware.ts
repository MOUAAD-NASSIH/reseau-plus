import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        // Determine folder based on field name
        const folder = file.fieldname === 'profilePicture' 
            ? 'social-workers-network/profile-pictures'
            : 'social-workers-network/documents';
        
        // Determine allowed formats based on field name
        const allowedFormats = file.fieldname === 'profilePicture'
            ? ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']
            : ['jpg', 'jpeg', 'png', 'pdf'];
        
        return {
            folder: folder,
            allowed_formats: allowedFormats,
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
        };
    },
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        console.log('File upload attempt:', {
            fieldname: file.fieldname,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: file.size
        });
        
        // Accept all image types
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images and PDFs are allowed.'));
        }
    }
});

export default upload;
