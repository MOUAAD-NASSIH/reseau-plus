import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        return {
            folder: 'social-workers-network/documents',
            allowed_formats: ['jpg', 'png', 'pdf'],
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
        };
    },
});

const upload = multer({ storage: storage });

export default upload;
