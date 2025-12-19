// lib/email.ts
import crypto from 'crypto';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  // For development: Just log the URL
  console.log('📧 Verification email for:', email);
  console.log('🔗 Verification URL:', verificationUrl);
  
  // TODO: In production, use a real email service like:
  // - Resend (https://resend.com)
  // - SendGrid
  // - AWS SES
  // - Nodemailer with SMTP
  
  /*
  // Example with Resend:
  const { Resend } = require('resend');
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  await resend.emails.send({
    from: 'noreply@flowstategrid.com',
    to: email,
    subject: 'Verify your email address',
    html: `
      <h1>Welcome to FlowStateGrid!</h1>
      <p>Click the link below to verify your email address:</p>
      <a href="${verificationUrl}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  });
  */
  
  return { success: true };
}