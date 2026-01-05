import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';
import { sanitizeEmail, isValidEmail } from '@/lib/sanitization';

const prisma = new PrismaClient();

/**
 * POST /api/orders/verify
 * Send verification code to guest email
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeEmail(email);

    // Check if email has orders
    const orderCount = await prisma.order.count({
      where: { email: sanitizedEmail },
    });

    if (orderCount === 0) {
      logger.info('No orders found for email', { email: sanitizedEmail });
      return NextResponse.json(
        { error: 'No orders found for this email' },
        { status: 404 }
      );
    }

    // Generate 6-digit code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // In production, send email with code
    // For now, log it (TODO: integrate with Resend/email service)
    logger.info('Verification code generated', {
      email: sanitizedEmail,
      code: verificationCode,
      orderCount,
    });

    console.log(`
╔══════════════════════════════════════╗
║  VERIFICATION CODE FOR: ${sanitizedEmail}
║  CODE: ${verificationCode}
║  Orders: ${orderCount}
╚══════════════════════════════════════╝
    `);

    // Store code in cookie (expires in 10 minutes)
    const response = NextResponse.json({
      success: true,
      message: 'Verification code sent to your email',
      orderCount,
    });

    response.cookies.set(`verify_${sanitizedEmail}`, verificationCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      sameSite: 'lax',
    });

    // TODO: Send email via Resend
    // await sendEmail({
    //   to: sanitizedEmail,
    //   subject: 'Your PhotoRestoreNow Verification Code',
    //   html: `Your code is: <strong>${verificationCode}</strong>`,
    // });

    return response;
  } catch (error) {
    logger.error('Error sending verification code', error as Error);
    return NextResponse.json(
      { error: 'Failed to send verification code' },
      { status: 500 }
    );
  }
}
