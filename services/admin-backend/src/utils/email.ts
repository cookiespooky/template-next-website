
import nodemailer from 'nodemailer';
import { logger } from './logger';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// Email templates
const templates = {
  'verify-email': (data: any) => `
    <h2>Verify Your Admin Account</h2>
    <p>Hello ${data.firstName},</p>
    <p>Please click the link below to verify your admin account:</p>
    <a href="${data.verificationUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
    <p>If you didn't request this, please ignore this email.</p>
  `,
  'reset-password': (data: any) => `
    <h2>Reset Your Password</h2>
    <p>Hello ${data.firstName},</p>
    <p>Please click the link below to reset your password:</p>
    <a href="${data.resetUrl}" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `
};

// Create transporter
const createTransporter = () => {
  if (process.env.NODE_ENV === 'development') {
    // Use Ethereal for development
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'ethereal.user@ethereal.email',
        pass: 'ethereal.pass'
      }
    });
  }

  // Production SMTP configuration
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    const template = templates[options.template as keyof typeof templates];
    if (!template) {
      throw new Error(`Email template '${options.template}' not found`);
    }

    const html = template(options.data);

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@courseplatform.com',
      to: options.to,
      subject: options.subject,
      html
    };

    const result = await transporter.sendMail(mailOptions);
    
    logger.info('Email sent successfully', {
      to: options.to,
      subject: options.subject,
      messageId: result.messageId
    });

    // Log preview URL for development
    if (process.env.NODE_ENV === 'development') {
      logger.info('Preview URL: ' + nodemailer.getTestMessageUrl(result));
    }
  } catch (error) {
    logger.error('Failed to send email', {
      to: options.to,
      subject: options.subject,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    throw error;
  }
};
