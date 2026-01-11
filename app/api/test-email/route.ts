import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email, type } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 })
    }

    let result

    switch (type) {
      case 'confirmation':
        result = await resend.emails.send({
          from: 'PhotoRestoreNow <onboarding@resend.dev>',
          to: email,
          subject: '✅ Order Confirmation - PhotoRestoreNow',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✨ PhotoRestoreNow</h1>
                          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Order Confirmed!</p>
                        </td>
                      </tr>
                      
                      <!-- Success Icon -->
                      <tr>
                        <td style="padding: 30px 30px 20px; text-align: center;">
                          <table width="80" height="80" cellpadding="0" cellspacing="0" style="background-color: #10b981; border-radius: 50%; margin: 0 auto;">
                            <tr>
                              <td align="center" valign="middle" style="color: #ffffff; font-size: 48px; font-weight: bold; line-height: 80px;">✓</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <h2 style="margin: 0 0 20px; color: #111827; font-size: 22px; text-align: center;">Payment Successful!</h2>
                          <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                            Thank you for choosing PhotoRestoreNow! Your payment has been confirmed and we're now processing your photos.
                          </p>
                          
                          <!-- Order Details Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin: 25px 0;">
                            <tr>
                              <td style="padding: 20px;">
                                <p style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">Order Details:</p>
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #6b7280; font-size: 14px;">Order ID:</td>
                                    <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right;">#TEST-${Date.now()}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #6b7280; font-size: 14px;">Package:</td>
                                    <td style="color: #111827; font-size: 14px; font-weight: 600; text-align: right;">Family Pack (3 photos)</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #6b7280; font-size: 14px;">Amount Paid:</td>
                                    <td style="color: #10b981; font-size: 16px; font-weight: 700; text-align: right;">$49.99</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- What's Next -->
                          <div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 15px 20px; border-radius: 4px; margin: 25px 0;">
                            <p style="margin: 0 0 10px; color: #1e40af; font-size: 15px; font-weight: 600;">📋 What's Next?</p>
                            <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 1.5;">
                              Our AI is processing your photos right now. You'll receive another email with download links within 24 hours.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">Need help? Contact us at <a href="mailto:support@photorestorenow.com" style="color: #3b82f6; text-decoration: none;">support@photorestorenow.com</a></p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 PhotoRestoreNow. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
        break

      case 'complete':
        result = await resend.emails.send({
          from: 'PhotoRestoreNow <onboarding@resend.dev>',
          to: email,
          subject: '🎉 Your Restored Photos Are Ready! - PhotoRestoreNow',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✨ PhotoRestoreNow</h1>
                          <p style="margin: 10px 0 0 0; color: #d1fae5; font-size: 16px;">Your Photos Are Ready!</p>
                        </td>
                      </tr>
                      
                      <!-- Success Icon -->
                      <tr>
                        <td style="padding: 30px 30px 20px; text-align: center;">
                          <div style="font-size: 60px; line-height: 1;">🎉</div>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <h2 style="margin: 0 0 20px; color: #111827; font-size: 22px; text-align: center;">Restoration Complete!</h2>
                          <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                            Great news! We've successfully restored your photos using advanced AI technology. Your memories are ready to be relived!
                          </p>
                          
                          <!-- Before/After Preview Concept -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                            <tr>
                              <td style="text-align: center; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 8px;">
                                <p style="margin: 0 0 10px; color: #92400e; font-size: 14px; font-weight: 600;">✨ AI-Enhanced Quality</p>
                                <p style="margin: 0; color: #78350f; font-size: 13px;">Colors restored • Scratches removed • Details enhanced</p>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Download Button -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="http://localhost:3000" style="display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
                                  📥 Download Your Photos
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Important Notice -->
                          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 15px 20px; border-radius: 4px; margin: 25px 0;">
                            <p style="margin: 0 0 5px; color: #991b1b; font-size: 14px; font-weight: 600;">⏰ Important</p>
                            <p style="margin: 0; color: #991b1b; font-size: 13px; line-height: 1.5;">
                              Your download links will expire in <strong>7 days</strong>. Make sure to save your restored photos!
                            </p>
                          </div>
                          
                          <!-- Satisfaction Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 25px 0;">
                            <tr>
                              <td style="text-align: center; padding: 20px; background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <p style="margin: 0 0 10px; color: #111827; font-size: 15px;">Love the results? 💙</p>
                                <p style="margin: 0; color: #6b7280; font-size: 13px;">Share your restored memories with family and friends!</p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 15px; color: #6b7280; font-size: 14px;">Questions? Email us at <a href="mailto:support@photorestorenow.com" style="color: #3b82f6; text-decoration: none;">support@photorestorenow.com</a></p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 PhotoRestoreNow. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
        break

      case 'welcome':
        result = await resend.emails.send({
          from: 'PhotoRestoreNow <onboarding@resend.dev>',
          to: email,
          subject: '👋 Welcome to PhotoRestoreNow!',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">✨ PhotoRestoreNow</h1>
                          <p style="margin: 10px 0 0 0; color: #ede9fe; font-size: 16px;">Welcome to Your Photo Restoration Journey!</p>
                        </td>
                      </tr>
                      
                      <!-- Welcome Icon -->
                      <tr>
                        <td style="padding: 30px 30px 20px; text-align: center;">
                          <table width="80" height="80" cellpadding="0" cellspacing="0" style="background-color: #8b5cf6; border-radius: 50%; margin: 0 auto;">
                            <tr>
                              <td align="center" valign="middle" style="color: #ffffff; font-size: 48px; line-height: 80px;">👋</td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <h2 style="margin: 0 0 20px; color: #111827; font-size: 22px; text-align: center;">Welcome Aboard!</h2>
                          <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6;">
                            Thank you for joining PhotoRestoreNow! We're excited to help you bring your precious memories back to life.
                          </p>
                          
                          <!-- Features Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #faf5ff; border-radius: 8px; margin: 25px 0;">
                            <tr>
                              <td style="padding: 25px;">
                                <p style="margin: 0 0 15px; color: #111827; font-size: 16px; font-weight: 600;">What You Can Do:</p>
                                <table width="100%" cellpadding="8" cellspacing="0">
                                  <tr>
                                    <td style="color: #8b5cf6; font-size: 20px; width: 30px;">📸</td>
                                    <td style="color: #4b5563; font-size: 14px; line-height: 1.6;">Restore old and damaged photos with AI</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #8b5cf6; font-size: 20px; width: 30px;">🎨</td>
                                    <td style="color: #4b5563; font-size: 14px; line-height: 1.6;">Colorize black & white memories</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #8b5cf6; font-size: 20px; width: 30px;">⚡</td>
                                    <td style="color: #4b5563; font-size: 14px; line-height: 1.6;">Fast processing in under 24 hours</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #8b5cf6; font-size: 20px; width: 30px;">💾</td>
                                    <td style="color: #4b5563; font-size: 14px; line-height: 1.6;">Download high-quality restored images</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- CTA Button -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                            <tr>
                              <td align="center">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/upload" 
                                   style="display: inline-block; background-color: #8b5cf6; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.3);">
                                  Start Restoring Photos
                                </a>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 20px 0 0; color: #9ca3af; font-size: 14px; text-align: center; line-height: 1.6;">
                            Need help? Contact us at <a href="mailto:support@photorestorenow.com" style="color: #8b5cf6; text-decoration: none;">support@photorestorenow.com</a>
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">You're receiving this because you created an account with PhotoRestoreNow</p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 PhotoRestoreNow. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
        break

      default:
        result = await resend.emails.send({
          from: 'PhotoRestoreNow <onboarding@resend.dev>',
          to: email,
          subject: '🧪 Test Email - PhotoRestoreNow',
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">🧪 PhotoRestoreNow</h1>
                          <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">Test Email</p>
                        </td>
                      </tr>
                      
                      <!-- Icon -->
                      <tr>
                        <td style="padding: 30px 30px 20px; text-align: center;">
                          <div style="font-size: 60px; line-height: 1;">✉️</div>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 0 40px 30px;">
                          <h2 style="margin: 0 0 20px; color: #111827; font-size: 22px; text-align: center;">Email System Working! ✅</h2>
                          <p style="margin: 0 0 20px; color: #6b7280; font-size: 16px; line-height: 1.6; text-align: center;">
                            If you're reading this, the email integration with <strong>Resend</strong> is working perfectly!
                          </p>
                          
                          <!-- Info Box -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0fdf4; border-radius: 8px; margin: 25px 0;">
                            <tr>
                              <td style="padding: 20px;">
                                <table width="100%" cellpadding="5" cellspacing="0">
                                  <tr>
                                    <td style="color: #166534; font-size: 14px;">📅 Sent at:</td>
                                    <td style="color: #166534; font-size: 14px; font-weight: 600; text-align: right;">${new Date().toLocaleString()}</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #166534; font-size: 14px;">📧 Service:</td>
                                    <td style="color: #166534; font-size: 14px; font-weight: 600; text-align: right;">Resend API</td>
                                  </tr>
                                  <tr>
                                    <td style="color: #166534; font-size: 14px;">✨ Status:</td>
                                    <td style="color: #15803d; font-size: 14px; font-weight: 700; text-align: right;">OPERATIONAL</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <!-- Feature List -->
                          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 25px 0;">
                            <p style="margin: 0 0 15px; color: #111827; font-size: 15px; font-weight: 600; text-align: center;">📋 Email Templates Ready:</p>
                            <ul style="margin: 0; padding: 0 0 0 20px; color: #6b7280; font-size: 14px; line-height: 2;">
                              <li>✅ Order Confirmation</li>
                              <li>✅ Restoration Complete</li>
                              <li>✅ Test Email (this one!)</li>
                            </ul>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">This is a test email from PhotoRestoreNow development environment</p>
                          <p style="margin: 0; color: #9ca3af; font-size: 12px;">© 2026 PhotoRestoreNow. All rights reserved.</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado com sucesso!',
      emailId: result.data?.id 
    })

  } catch (error: any) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json({ 
      error: 'Erro ao enviar email',
      details: error.message 
    }, { status: 500 })
  }
}
