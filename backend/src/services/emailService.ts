import { sendEmail } from '../lib/nodemailer';

export const sendVerificationEmail = async (to: string, token: string) => {
    const subject = "Verify your email";
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/verify-email?token=${token}`;
    const html = `
        <h1>Email Verification</h1>
        <p>Please click the link below to verify your email:</p>
        <a href="${verificationUrl}">Verify Email</a>
    `;
    return sendEmail(to, subject, html);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const subject = "Password Reset Request";
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/reset-password?token=${token}`;
    const html = `
        <h1>Password Reset</h1>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This password reset link we'll expire in 10 minutes</p>
        <p>If you did not request this, please ignore this email.</p>
    `;
    return sendEmail(to, subject, html);
};
