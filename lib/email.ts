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
  
  // Console logging for development
  console.log('\n========================================');
  console.log('📧 VERIFICATION EMAIL');
  console.log('========================================');
  console.log('To:', email);
  console.log('Subject: Verify your FlowStateGrid account');
  console.log('🔗 Verification Link:', verificationUrl);
  console.log('⏰ Expires in: 24 hours');
  console.log('========================================\n');
  
  return { success: true, devMode: true };
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  // Console logging for development
  console.log('\n========================================');
  console.log('🔒 PASSWORD RESET EMAIL');
  console.log('========================================');
  console.log('To:', email);
  console.log('Subject: Reset your FlowStateGrid password');
  console.log('🔗 Reset Link:', resetUrl);
  console.log('⏰ Expires in: 1 hour');
  console.log('========================================\n');
  
  return { success: true, devMode: true };
}