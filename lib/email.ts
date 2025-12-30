// lib/email.ts
import crypto from 'crypto';
import * as brevo from '@getbrevo/brevo';

const apiInstance = new brevo.TransactionalEmailsApi();
if (process.env.BREVO_API_KEY) {
  apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_API_KEY);
}

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getVerificationTokenExpiry(): Date {
  return new Date(Date.now() + 24 * 60 * 60 * 1000);
}

export function generatePasswordResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function getPasswordResetTokenExpiry(): Date {
  return new Date(Date.now() + 60 * 60 * 1000);
}

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  if (!process.env.BREVO_API_KEY) {
    console.log('\n========================================');
    console.log('📧 VERIFICATION EMAIL');
    console.log('========================================');
    console.log('To:', email);
    console.log('🔗 Verification Link:', verificationUrl);
    console.log('⏰ Expires in: 24 hours');
    console.log('========================================\n');
    return { success: true, devMode: true };
  }

  try {
    console.log('Attempting to send verification email to:', email);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Verify your FlowStateGrid account";
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.htmlContent = getVerificationEmailHTML(verificationUrl, email);
    sendSmtpEmail.sender = { name: "FlowStateGrid", email: "noreply@flowstategrid.com" };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Email sent successfully:', result);
    console.log('Message ID:', result.body?.messageId);
    
    return { success: true, messageId: result.body?.messageId };
  } catch (error: any) {
    console.error('❌ Brevo error:', error);
    console.error('Error body:', error.body);
    console.error('Error response:', error.response);
    throw error;
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${token}`;
  
  if (!process.env.BREVO_API_KEY) {
    console.log('\n========================================');
    console.log('🔒 PASSWORD RESET EMAIL');
    console.log('========================================');
    console.log('To:', email);
    console.log('🔗 Reset Link:', resetUrl);
    console.log('⏰ Expires in: 1 hour');
    console.log('========================================\n');
    return { success: true, devMode: true };
  }

  try {
    console.log('Attempting to send password reset email to:', email);
    
    const sendSmtpEmail = new brevo.SendSmtpEmail();
    sendSmtpEmail.subject = "Reset your FlowStateGrid password";
    sendSmtpEmail.to = [{ email }];
    sendSmtpEmail.htmlContent = getPasswordResetEmailHTML(resetUrl, email);
    sendSmtpEmail.sender = { name: "FlowStateGrid", email: "flowstategrid@gmail.com" };

    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('✅ Password reset email sent successfully:', result);
    console.log('Message ID:', result.body?.messageId);
    
    return { success: true, messageId: result.body?.messageId };
  } catch (error: any) {
    console.error('❌ Brevo error:', error);
    console.error('Error body:', error.body);
    console.error('Error response:', error.response);
    throw error;
  }
}

function getVerificationEmailHTML(verificationUrl: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 32px; font-weight: 700;">
            FlowStateGrid
          </h1>
        </div>
        
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
            Verify Your Email Address
          </h2>
          
          <p style="color: #64748b; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Hi there! 👋
          </p>
          
          <p style="color: #64748b; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Thanks for signing up for FlowStateGrid! To complete your registration, please verify your email address by clicking the button below.
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Verify Email Address
            </a>
          </div>
          
          <p style="color: #64748b; margin: 24px 0 0 0; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          
          <div style="background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin: 12px 0 24px 0; word-break: break-all;">
            <a href="${verificationUrl}" style="color: #6366f1; text-decoration: none; font-size: 14px;">
              ${verificationUrl}
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0; padding-top: 24px;">
            <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">
              <strong>⏰ This link will expire in 24 hours.</strong>
            </p>
            
            <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.6;">
              If you didn't create an account, you can safely ignore this email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
          <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">
            This email was sent to <strong>${email}</strong>
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} FlowStateGrid. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

function getPasswordResetEmailHTML(resetUrl: string, email: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f6f9fc;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="color: #6366f1; margin: 0; font-size: 32px; font-weight: 700;">
            FlowStateGrid
          </h1>
        </div>
        
        <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #1e293b; margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">
            Reset Your Password
          </h2>
          
          <p style="color: #64748b; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            We received a request to reset your password for your FlowStateGrid account.
          </p>
          
          <p style="color: #64748b; margin: 0 0 24px 0; font-size: 16px; line-height: 1.6;">
            Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #f97316 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: 600; font-size: 16px;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #64748b; margin: 24px 0 0 0; font-size: 14px; line-height: 1.6;">
            Or copy and paste this link into your browser:
          </p>
          
          <div style="background: #f1f5f9; border-radius: 8px; padding: 12px 16px; margin: 12px 0 24px 0; word-break: break-all;">
            <a href="${resetUrl}" style="color: #ef4444; text-decoration: none; font-size: 14px;">
              ${resetUrl}
            </a>
          </div>
          
          <div style="border-top: 1px solid #e2e8f0; margin: 32px 0 24px 0; padding-top: 24px;">
            <p style="color: #64748b; margin: 0 0 8px 0; font-size: 14px; line-height: 1.6;">
              <strong>⏰ This link will expire in 1 hour.</strong>
            </p>
            
            <p style="color: #64748b; margin: 0; font-size: 14px; line-height: 1.6;">
              If you didn't request a password reset, you can safely ignore this email.
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 32px; padding: 0 20px;">
          <p style="color: #94a3b8; margin: 0 0 8px 0; font-size: 14px;">
            This email was sent to <strong>${email}</strong>
          </p>
          <p style="color: #94a3b8; margin: 0; font-size: 12px;">
            © ${new Date().getFullYear()} FlowStateGrid. All rights reserved.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}