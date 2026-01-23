/**
 * Profile Picture/logo Service - handles upload, validation, and management for all user types
 */

import cloudinary from "../lib/cloudinary";
import { prisma } from "../lib/prisma";

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export class ProfilePictureValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfilePictureValidationError';
    }
}

export class ProfilePictureUploadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfilePictureUploadError';
    }
}

export class ProfilePictureAuthorizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'ProfilePictureAuthorizationError';
    }
}

export interface ProfilePictureUploadResult {
    url: string;
    publicId: string;
}

export interface FileValidationInput {
    mimetype: string;
    size: number;
}

export const validateFileType = (mimetype: string): boolean => {
    return ALLOWED_MIME_TYPES.includes(mimetype);
};

export const validateFileSize = (size: number): boolean => {
    return size <= MAX_FILE_SIZE;
};

export const validateFile = (file: FileValidationInput): void => {
    if (!validateFileType(file.mimetype)) {
        throw new ProfilePictureValidationError(
            'Invalid file type. Allowed: JPEG, PNG, WebP'
        );
    }

    if (!validateFileSize(file.size)) {
        throw new ProfilePictureValidationError(
            'File size exceeds 5MB limit'
        );
    }
};

export const extractPublicIdFromUrl = (url: string): string | null => {
    try {
        const urlParts = url.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1) return null;

        const pathAfterUpload = urlParts.slice(uploadIndex + 2).join('/');
        const publicId = pathAfterUpload.replace(/\.[^/.]+$/, '');
        return publicId || null;
    } catch {
        return null;
    }
};

export const deleteFromCloudinary = async (publicId: string): Promise<boolean> => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        return result.result === 'ok';
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        return false;
    }
};

export const uploadToCloudinary = async (
    fileBuffer: Buffer,
    folder: string = 'social-workers-network/worker-profile-pictures',
    transformation: any[] = [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
): Promise<ProfilePictureUploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation
            },
            (error, result) => {
                if (error) {
                    reject(new ProfilePictureUploadError(
                        `Failed to upload image: ${error.message}`
                    ));
                } else if (result) {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id
                    });
                } else {
                    reject(new ProfilePictureUploadError('Failed to upload image'));
                }
            }
        );
        uploadStream.end(fileBuffer);
    });
};

export const getProfilePictureUrl = async (
    userId: number,
    role: string
): Promise<string | null> => {
    if (role === 'institution') {
        const institution = await prisma.institution.findUnique({
            where: { userId },
            select: { logo: true }
        });
        return institution?.logo || null;
    }
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { profilePicture: true }
    });
    return user?.profilePicture || null;
};

export const uploadProfileImage = async (
    userId: number,
    file: Express.Multer.File,
    config: {
        folder: string,
        transformation?: any[],
        entityType: 'user' | 'institution', // 'user' handles both worker and admin
        checkRole?: string // Optional role check for admins
    }
): Promise<ProfilePictureUploadResult> => {
    validateFile({ mimetype: file.mimetype, size: file.size });

    let currentImageUrl: string | null = null;
    let dbUpdate: (url: string) => Promise<any>;

    if (config.entityType === 'institution') {
        const institution = await prisma.institution.findUnique({
            where: { userId },
            select: { id: true, logo: true }
        });

        if (!institution) {
            throw new ProfilePictureAuthorizationError('Institution not found');
        }

        currentImageUrl = institution.logo;
        dbUpdate = async (url) => prisma.institution.update({
            where: { id: institution.id },
            data: { logo: url }
        });
    } else {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { role: true }
        });

        if (!user) {
            throw new ProfilePictureAuthorizationError('User not found');
        }

        if (config.checkRole && user.role.name !== config.checkRole) {
            throw new ProfilePictureAuthorizationError('Not authorized to update this profile');
        }

        currentImageUrl = user.profilePicture;
        dbUpdate = async (url) => prisma.user.update({
            where: { id: userId },
            data: { profilePicture: url }
        });
    }

    // Delete existing image if any
    if (currentImageUrl) {
        const publicId = extractPublicIdFromUrl(currentImageUrl);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }
    }

    // Upload new image
    const uploadResult = await uploadToCloudinary(
        file.buffer,
        config.folder,
        config.transformation
    );

    // Update database
    await dbUpdate(uploadResult.url);

    return uploadResult;
};

export const uploadWorkerProfilePicture = async (
    userId: number,
    file: Express.Multer.File
): Promise<ProfilePictureUploadResult> => {
    return uploadProfileImage(userId, file, {
        folder: 'social-workers-network/worker-profile-pictures',
        entityType: 'user',
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
    });
};

export const uploadInstitutionLogo = async (
    userId: number,
    file: Express.Multer.File
): Promise<ProfilePictureUploadResult> => {
    return uploadProfileImage(userId, file, {
        folder: 'social-workers-network/institution-logos',
        entityType: 'institution',
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'center' }]
    });
};

export const deleteWorkerProfilePicture = async (userId: number): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, profilePicture: true }
    });

    if (!user) {
        throw new ProfilePictureAuthorizationError('User not found');
    }

    if (user.profilePicture) {
        const publicId = extractPublicIdFromUrl(user.profilePicture);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { profilePicture: null }
        });
    }
};

export const deleteInstitutionLogo = async (userId: number): Promise<void> => {
    const institution = await prisma.institution.findUnique({
        where: { userId },
        select: { id: true, logo: true }
    });

    if (!institution) {
        throw new ProfilePictureAuthorizationError('Institution not found');
    }

    if (institution.logo) {
        const publicId = extractPublicIdFromUrl(institution.logo);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }

        await prisma.institution.update({
            where: { id: institution.id },
            data: { logo: null }
        });
    }
};

export const uploadAdminProfilePicture = async (
    userId: number,
    file: Express.Multer.File
): Promise<ProfilePictureUploadResult> => {
    return uploadProfileImage(userId, file, {
        folder: 'social-workers-network/admin-profile-pictures',
        entityType: 'user',
        checkRole: 'admin',
        transformation: [{ width: 500, height: 500, crop: 'fill', gravity: 'face' }]
    });
};

export const deleteAdminProfilePicture = async (userId: number): Promise<void> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { role: true }
    });

    if (!user) {
        throw new ProfilePictureAuthorizationError('User not found');
    }

    if (user.role.name !== 'admin') {
        throw new ProfilePictureAuthorizationError('Not authorized to update this profile');
    }

    if (user.profilePicture) {
        const publicId = extractPublicIdFromUrl(user.profilePicture);
        if (publicId) {
            await deleteFromCloudinary(publicId);
        }

        await prisma.user.update({
            where: { id: user.id },
            data: { profilePicture: null }
        });
    }
};

export const verifyProfileOwnership = async (
    requestingUserId: number,
    targetUserId: number
): Promise<boolean> => {
    return requestingUserId === targetUserId;
};
