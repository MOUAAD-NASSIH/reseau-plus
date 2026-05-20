import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test Cloudinary connection
if (process.env.NODE_ENV !== 'production') {
    cloudinary.api.ping()
        .then(() => console.log('Cloudinary connected!'))
        .catch(err => console.error('Cloudinary connection error:', err));
}

export default cloudinary;
