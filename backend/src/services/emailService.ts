import { sendEmail } from '../lib/nodemailer';

const getEmailTemplate = (title: string, message: string, buttonText: string, url: string, footerNote: string = "") => {
    return `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 0; background-color: #ffffff;">
            <!-- Header -->
            <div style="text-align: center; padding: 20px 0;">
                <h1 style="color: #16a34a; margin: 0; font-size: 24px; font-weight: bold;">Réseau+</h1>
            </div>
            
            <!-- Content -->
            <div style="border: 1px solid #e5e7eb; border-radius: 12px; padding: 40px; margin: 0 20px;">
                <h2 style="color: #111827; margin-top: 0; font-size: 20px; font-weight: 600;">${title}</h2>
                <p style="color: #4b5563; font-size: 16px; line-height: 24px;">${message}</p>
                
                <div style="text-align: center; margin: 32px 0;">
                    <a href="${url}" style="background-color: #16a34a; color: #ffffff; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; transition: background-color 0.2s;">
                        ${buttonText}
                    </a>
                </div>
                
                ${footerNote ? `<p style="color: #6b7280; font-size: 14px; margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 24px;">${footerNote}</p>` : ''}
            </div>
            
            <!-- Footer -->
            <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
                <p style="margin: 0;">&copy; ${new Date().getFullYear()} Réseau+. All rights reserved.</p>
                <p style="margin: 4px 0;">Connecting independent workers with institutions for mission success.</p>
            </div>
        </div>
    `;
};

export const sendVerificationEmail = async (to: string, token: string) => {
    const subject = "Verify your email - Réseau+";
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    const html = getEmailTemplate(
        "Email Verification",
        "Welcome to Réseau+! Please verify your email address to activate your account and access all features.",
        "Verify Email",
        verificationUrl,
        "If you did not create an account, no further action is required."
    );

    return sendEmail(to, subject, html);
};

export const sendPasswordResetEmail = async (to: string, token: string) => {
    const subject = "Reset your password - Réseau+";
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    const html = getEmailTemplate(
        "Password Reset Request",
        "You requested a password reset. Click the button below to choose a new password.",
        "Reset Password",
        resetUrl,
        "This link will expire in 10 minutes. If you did not request this password reset, please ignore this email or contact support if you have concerns."
    );

    return sendEmail(to, subject, html);
};
