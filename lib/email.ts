// lib/email.ts
import crypto from 'crypto';

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getPasswordResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000); // 1 hour
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  console.log('📧 Verification email would be sent to:', email);
  console.log('🔗 Verification Link:', verificationUrl);
  
  return { success: true, devMode: true };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  console.log('🔒 Password reset email would be sent to:', email);
  console.log('🔗 Reset Link:', resetUrl);
  
  return { success: true, devMode: true };
}