/**
 * Profile Picture Service - handles upload, validation, and management for all user types
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
    folder: string = 'social-workers-network/worker-profile-pictures'
): Promise<ProfilePictureUploadResult> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [
                    { width: 500, height: 500, crop: 'fill', gravity: 'face' }
                ]
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

export const uploadWorkerProfilePicture = async (
    userId: number,
    file: Express.Multer.File
): Promise<ProfilePictureUploadResult> => {
    validateFile({ mimetype: file.mimetype, size: file.size });

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
    }

    const uploadResult = await uploadToCloudinary(file.buffer);

    await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: uploadResult.url }
    });

    return uploadResult;
};

export const uploadInstitutionLogo = async (
    userId: number,
    file: Express.Multer.File
): Promise<ProfilePictureUploadResult> => {
    validateFile({ mimetype: file.mimetype, size: file.size });

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
    }

    const uploadResult = await uploadToCloudinary(
        file.buffer,
        'social-workers-network/institution-logos'
    );

    await prisma.institution.update({
        where: { id: institution.id },
        data: { logo: uploadResult.url }
    });

    return uploadResult;
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
    validateFile({ mimetype: file.mimetype, size: file.size });

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
    }

    const uploadResult = await uploadToCloudinary(
        file.buffer,
        'social-workers-network/admin-profile-pictures'
    );

    await prisma.user.update({
        where: { id: user.id },
        data: { profilePicture: uploadResult.url }
    });

    return uploadResult;
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
