/**
 * Email Service
 * Uses Resend. All styles are inline — <style> blocks are stripped by Gmail/Outlook.
 */

import { Resend } from 'resend';
import { EmailOptions, RestorationCompleteEmail } from '@/types';
import { EMAIL_SUBJECTS } from '@/lib/constants';
import { Analytics } from '@/lib/analytics';

if (!process.env.RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not configured. Email sending will fail.');
}

const resend = new Resend(process.env.RESEND_API_KEY);
const fromEmailAddress = process.env.RESEND_FROM_EMAIL || 'noreply@photorestorenow.com';
const supportEmail = process.env.SUPPORT_EMAIL || fromEmailAddress;
const fromEmail = `PhotoRestoreNow <${fromEmailAddress}>`;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://photorestorenow.com';

// ─── Shared helpers ───────────────────────────────────────────────────────────

function btn(href: string, label: string, color = '#2563eb'): string {
  return `<a href="${href}"
    style="display:inline-block;background-color:${color};color:#ffffff;text-decoration:none;
           padding:13px 28px;border-radius:6px;font-weight:600;font-size:15px;line-height:1;"
  >${label}</a>`;
}

function infoRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 0;color:#6b7280;font-size:14px;width:130px;vertical-align:top;">${label}</td>
    <td style="padding:8px 0;color:#111827;font-size:14px;font-weight:600;">${value}</td>
  </tr>`;
}

function shell(
  headerBg: string,
  headerTitle: string,
  headerSub: string,
  body: string,
  footerExtra = ''
): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f3f4f6;
             font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"
         style="background-color:#f3f4f6;padding:40px 16px;">
    <tr><td align="center">

      <table width="600" cellpadding="0" cellspacing="0"
             style="max-width:600px;background-color:#ffffff;border-radius:12px;
                    overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

        <!-- HEADER -->
        <tr>
          <td style="background-color:${headerBg};padding:36px 40px;text-align:center;">
            <p style="margin:0 0 10px;color:rgba(255,255,255,0.7);font-size:12px;
                      font-weight:700;letter-spacing:2.5px;text-transform:uppercase;">
              PhotoRestoreNow
            </p>
            <h1 style="margin:0 0 8px;color:#ffffff;font-size:26px;font-weight:700;
                        line-height:1.2;">${headerTitle}</h1>
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:15px;">${headerSub}</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${body}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background-color:#f9fafb;border-top:1px solid #e5e7eb;
                      padding:24px 40px;text-align:center;">
            ${footerExtra ? `<p style="margin:0 0 6px;color:#6b7280;font-size:13px;">${footerExtra}</p>` : ''}
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              &copy; ${year} PhotoRestoreNow. All rights reserved.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Generic send ─────────────────────────────────────────────────────────────

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
      Analytics.emailSent('generic', options.to, false);
      return false;
    }

    console.log('Email sent:', data?.id);
    Analytics.emailSent('generic', options.to, true);
    return true;
  } catch (err) {
    console.error('Email sending error:', err);
    Analytics.emailSent('generic', options.to, false);
    return false;
  }
}

// ─── Welcome ──────────────────────────────────────────────────────────────────

export async function sendWelcomeEmail(
  email: string,
  name?: string | null
): Promise<boolean> {
  const displayName = name ? name.split(' ')[0] : 'there';

  const body = `
    <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
      Hi ${displayName}! We're glad you're here. PhotoRestoreNow uses advanced AI
      to bring your old, damaged, or faded photos back to life — quickly and affordably.
    </p>

    <!-- Feature list -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#eff6ff;border-radius:8px;margin:0 0 28px;">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 14px;color:#1e40af;font-size:14px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;">What you can do</p>
        <table width="100%" cellpadding="6" cellspacing="0">
          <tr>
            <td style="width:28px;font-size:18px;">📸</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              <strong style="color:#111827;">Restore</strong> — remove scratches, tears, and fading
            </td>
          </tr>
          <tr>
            <td style="width:28px;font-size:18px;">🎨</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              <strong style="color:#111827;">Colorize</strong> — bring black-and-white photos to life
            </td>
          </tr>
          <tr>
            <td style="width:28px;font-size:18px;">⚡</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              <strong style="color:#111827;">Fast results</strong> — ready within 24 hours
            </td>
          </tr>
          <tr>
            <td style="width:28px;font-size:18px;">🛡️</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              <strong style="color:#111827;">100% money-back guarantee</strong> — no risk, no hassle
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr><td align="center">
        ${btn(`${APP_URL}/pricing`, 'Restore My Photos')}
      </td></tr>
    </table>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
      Questions? Reply to this email or write to
      <a href="mailto:${supportEmail}"
         style="color:#2563eb;text-decoration:none;">${supportEmail}</a>
    </p>
  `;

  const html = shell(
    '#2563eb',
    'Welcome to PhotoRestoreNow!',
    'Your memories deserve to look their best.',
    body
  );

  return sendEmail({
    to: email,
    subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION
      ? '👋 Welcome to PhotoRestoreNow!'
      : '👋 Welcome to PhotoRestoreNow!',
    html,
  });
}

// ─── Order Confirmation ───────────────────────────────────────────────────────

const PACKAGE_NAMES: Record<string, string> = {
  '1-photo':  'Single Photo',
  '3-photos': 'Family Package (3 photos)',
  '5-photos': 'Standard Package (5 photos)',
  '10-photos': 'Album Package (10 photos)',
};

export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  packageId: string,
  photoCount: number,
  amount: number
): Promise<boolean> {
  const packageName = PACKAGE_NAMES[packageId] || packageId;
  const formattedAmount = `$${(amount / 100).toFixed(2)}`;

  const body = `
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;">
      Thank you for your order! Your precious memories are now in our processing queue.
      We'll send you another email as soon as your photos are ready.
    </p>

    <!-- Order details table -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;
                  margin:0 0 28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 14px;color:#374151;font-size:14px;font-weight:700;">Order Details</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${infoRow('Order ID', `<span style="font-family:monospace;font-size:13px;">${orderId}</span>`)}
          ${infoRow('Package', packageName)}
          ${infoRow('Photos', `${photoCount} photo${photoCount !== 1 ? 's' : ''}`)}
          ${infoRow('Amount paid', formattedAmount)}
        </table>
      </td></tr>
    </table>

    <!-- Next steps -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#eff6ff;border-radius:8px;margin:0 0 28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;color:#1e40af;font-size:14px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;">What happens next</p>
        <table width="100%" cellpadding="5" cellspacing="0">
          <tr>
            <td style="width:28px;color:#2563eb;font-weight:700;font-size:14px;">1.</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              Our AI runs face restoration, color reconstruction, and 4× sharpening
            </td>
          </tr>
          <tr>
            <td style="width:28px;color:#2563eb;font-weight:700;font-size:14px;">2.</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              You'll receive a download link by email — usually within 24 hours
            </td>
          </tr>
          <tr>
            <td style="width:28px;color:#2563eb;font-weight:700;font-size:14px;">3.</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              Download links stay active for 7 days after delivery
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
      Questions? Reply to this email — we're happy to help.
    </p>
  `;

  const html = shell(
    '#2563eb',
    'Order Confirmed!',
    'Your photos are in the queue.',
    body,
    `Order ID: ${orderId}`
  );

  return sendEmail({ to: email, subject: EMAIL_SUBJECTS.ORDER_CONFIRMATION, html });
}

// ─── Restoration Complete ─────────────────────────────────────────────────────

export async function sendRestorationComplete(
  options: RestorationCompleteEmail
): Promise<boolean> {
  const expiryDate = new Intl.DateTimeFormat('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  }).format(options.expiresAt);

  const downloadButtons = options.downloadLinks
    .map(
      (link, i) => {
        const filename = `restored-photo-${i + 1}.jpg`;
        const proxyUrl = `${APP_URL}/api/download?url=${encodeURIComponent(link)}&filename=${encodeURIComponent(filename)}`;
        return `
      <tr><td style="padding:6px 0;text-align:center;">
        ${btn(proxyUrl, `⬇ Download Photo ${i + 1}`, '#059669')}
      </td></tr>`;
      }
    )
    .join('');

  const body = `
    <p style="margin:0 0 24px;color:#374151;font-size:16px;line-height:1.7;">
      Your restored photo${options.downloadLinks.length > 1 ? 's are' : ' is'} ready!
      Click the button${options.downloadLinks.length > 1 ? 's' : ''} below to download.
    </p>

    <!-- Download buttons -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;
                  margin:0 0 24px;">
      <tr><td style="padding:24px;">
        <p style="margin:0 0 16px;color:#166534;font-size:14px;font-weight:700;text-align:center;">
          Your Restored Photo${options.downloadLinks.length > 1 ? 's' : ''}
        </p>
        <table width="100%" cellpadding="0" cellspacing="0">
          ${downloadButtons}
        </table>
      </td></tr>
    </table>

    <!-- Expiry warning -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#fffbeb;border:1px solid #fde68a;border-radius:8px;
                  margin:0 0 28px;">
      <tr><td style="padding:16px 20px;">
        <p style="margin:0;color:#92400e;font-size:14px;line-height:1.6;">
          ⚠️ <strong>Links expire on ${expiryDate}.</strong>
          Please save your photos before then.
        </p>
      </td></tr>
    </table>

    <!-- Tips -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;color:#374151;font-size:14px;font-weight:700;">
          Tips for your restored photos
        </p>
        <table width="100%" cellpadding="4" cellspacing="0">
          <tr>
            <td style="width:22px;font-size:14px;">✅</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              Back up to Google Photos, iCloud, or a USB drive
            </td>
          </tr>
          <tr>
            <td style="width:22px;font-size:14px;">🖨️</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              Print at a local pharmacy or online (Shutterfly, Walgreens)
            </td>
          </tr>
          <tr>
            <td style="width:22px;font-size:14px;">🎁</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              Share with family — they'll love seeing these memories restored
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
      Not satisfied? Reply to this email within 7 days for a full refund — no questions asked.
    </p>
  `;

  const html = shell(
    '#059669',
    '🎉 Your Photos Are Ready!',
    'Your memories have been restored.',
    body,
    `Order ID: ${options.jobId}`
  );

  return sendEmail({
    to: options.customerEmail,
    subject: EMAIL_SUBJECTS.RESTORATION_COMPLETE,
    html,
  });
}

// ─── Restoration Failed ───────────────────────────────────────────────────────

export async function sendRestorationFailed(
  email: string,
  orderId: string,
  _errorMessage: string
): Promise<boolean> {
  const body = `
    <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.7;">
      We're sorry — something went wrong while processing your order.
      Our team has been automatically notified and we will reach out
      within <strong>24 hours</strong> to resolve this.
    </p>

    <!-- What we'll do -->
    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#fef2f2;border:1px solid #fecaca;border-radius:8px;
                  margin:0 0 28px;">
      <tr><td style="padding:20px 24px;">
        <p style="margin:0 0 12px;color:#991b1b;font-size:14px;font-weight:700;">What happens next</p>
        <table width="100%" cellpadding="5" cellspacing="0">
          <tr>
            <td style="width:28px;color:#dc2626;font-weight:700;font-size:14px;">1.</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              Our team will investigate and retry your restoration
            </td>
          </tr>
          <tr>
            <td style="width:28px;color:#dc2626;font-weight:700;font-size:14px;">2.</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              You'll hear from us within 24 hours with an update
            </td>
          </tr>
          <tr>
            <td style="width:28px;color:#dc2626;font-weight:700;font-size:14px;">3.</td>
            <td style="color:#374151;font-size:14px;line-height:1.6;">
              If we can't fix it, you'll receive a full refund — no questions asked
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

    <table width="100%" cellpadding="0" cellspacing="0"
           style="background-color:#f9fafb;border-radius:8px;margin:0 0 24px;">
      <tr><td style="padding:16px 24px;">
        <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">
          <strong style="color:#374151;">Order ID:</strong>
          <span style="font-family:monospace;">${orderId}</span><br>
          Please include this in any reply so we can find your order quickly.
        </p>
      </td></tr>
    </table>

    <p style="margin:0;color:#9ca3af;font-size:13px;text-align:center;">
      You can also contact us directly at
      <a href="mailto:${supportEmail}"
         style="color:#2563eb;text-decoration:none;">${supportEmail}</a>
    </p>
  `;

  const html = shell(
    '#dc2626',
    'There Was a Problem With Your Order',
    "We're on it — you won't be charged if we can't fix it.",
    body,
    `Order ID: ${orderId}`
  );

  return sendEmail({ to: email, subject: EMAIL_SUBJECTS.RESTORATION_FAILED, html });
}

// ─── Convenience object ───────────────────────────────────────────────────────

export const emailService = {
  sendEmail,
  sendOrderConfirmation,
  sendRestorationComplete,
  sendRestorationFailed,
  sendWelcomeEmail,
};
