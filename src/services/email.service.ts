import nodemailer from 'nodemailer';
import { LOGGER } from '../utils/logger.js';

export class EmailService {
  private static transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT!),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      ciphers: 'SSLv3'
    }
  });

  // Add to EmailService for testing
  static async testConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      LOGGER.info('SMTP connection verified successfully');
    } catch (error) {
      LOGGER.error('SMTP connection failed:', error);
    }
  }


  static async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: 'Password Reset Request - PAN Connect',
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset for your PAN Connect account.</p>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      LOGGER.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      LOGGER.error('Failed to send password reset email:', error);
      throw new Error('Failed to send reset email');
    }
  }
}
