/**
 * Email Service
 * 
 * Handles all email communications using Resend
 * Templates for order confirmation, processing updates, and delivery
 */

import { Resend } from 'resend';
import { EmailOptions, RestorationCompleteEmail } from '@/types';
import { EMAIL_SUBJECTS } from '@/lib/constants';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not configured. Email sending will fail.');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@photorestorenow.com';

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    if (error) {
      console.error('Resend email error:', error);
      return false;
    }

    console.log('Email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  packageName: string,
  photoCount: number,
  amount: number
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2563eb; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
          .details { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Order Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>Thank you for choosing PhotoRestoreNow! We've received your order and your precious memories are in good hands.</p>
            
            <div class="details">
              <h3>Order Details</h3>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Package:</strong> ${packageName}</p>
              <p><strong>Photos:</strong> ${photoCount}</p>
              <p><strong>Amount:</strong> $${(amount / 100).toFixed(2)}</p>
            </div>

            <p>Your photos are now in our processing queue. We'll notify you via email when the restoration is complete.</p>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Our AI will carefully restore your photos</li>
              <li>You'll receive an email when processing is complete (usually within 24 hours)</li>
              <li>Download your restored photos from the link we'll send</li>
            </ul>

            <p>If you have any questions, feel free to reply to this email.</p>
            
            <p>Best regards,<br>The PhotoRestoreNow Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 PhotoRestoreNow. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION,
    html,
  });
}

/**
 * Send restoration complete email
 */
export async function sendRestorationComplete(
  options: RestorationCompleteEmail
): Promise<boolean> {
  const downloadLinksHtml = options.downloadLinks
    .map(
      (link, index) =>
        `<li><a href="${link}" class="button">Download Photo ${index + 1}</a></li>`
    )
    .join('');

  const expiryDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(options.expiresAt);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #10b981; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .downloads { background: white; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .downloads ul { list-style: none; padding: 0; }
          .downloads li { margin: 10px 0; }
          .warning { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Your Photos Are Ready!</h1>
          </div>
          <div class="content">
            <p>Great news! Your restored photos are ready to download.</p>
            
            <div class="downloads">
              <h3>Download Your Restored Photos:</h3>
              <ul>
                ${downloadLinksHtml}
              </ul>
            </div>

            <div class="warning">
              <p><strong>⚠️ Important:</strong> These download links will expire on <strong>${expiryDate}</strong>. Please download your photos before then.</p>
            </div>

            <p>We hope you love the results! If you have any questions or concerns, please don't hesitate to reach out.</p>
            
            <p><strong>Tips for your restored photos:</strong></p>
            <ul>
              <li>Save them to a safe location</li>
              <li>Consider backing up to cloud storage</li>
              <li>Share them with family and friends</li>
              <li>Print them to preserve the memories</li>
            </ul>

            <p>Thank you for trusting PhotoRestoreNow with your precious memories!</p>
            
            <p>Best regards,<br>The PhotoRestoreNow Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 PhotoRestoreNow. All rights reserved.</p>
            <p>Order ID: ${options.jobId}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: options.customerEmail,
    subject: EMAIL_SUBJECTS.RESTORATION_COMPLETE,
    html,
  });
}

/**
 * Send restoration failed email
 */
export async function sendRestorationFailed(
  email: string,
  orderId: string,
  errorMessage: string
): Promise<boolean> {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .error-box { background: #fee2e2; padding: 20px; border-radius: 6px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Issue with Your Order</h1>
          </div>
          <div class="content">
            <p>Dear Customer,</p>
            <p>We encountered an issue while processing your photo restoration order (ID: ${orderId}).</p>
            
            <div class="error-box">
              <p><strong>Error:</strong> ${errorMessage}</p>
            </div>

            <p>Our team has been notified and we'll reach out to you within 24 hours to resolve this issue.</p>
            
            <p>We sincerely apologize for any inconvenience. Your satisfaction is our priority.</p>
            
            <p>Best regards,<br>The PhotoRestoreNow Team</p>
          </div>
          <div class="footer">
            <p>&copy; 2024 PhotoRestoreNow. All rights reserved.</p>
          </div>
        </div>
      </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.RESTORATION_FAILED,
    html,
  });
}

/**
 * Email service object for convenient imports
 */
export const emailService = {
  sendEmail,
  sendOrderConfirmation,
  sendRestorationComplete,
  sendRestorationFailed,
};
