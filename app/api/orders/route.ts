import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logger } from '@/lib/logger';
import { sanitizeEmail } from '@/lib/sanitization';

const prisma = new PrismaClient();

function extractEmailFromGuestToken(rawToken: string): string | null {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || !rawToken) return null;
    const { payload, sig } = JSON.parse(
      Buffer.from(rawToken, 'base64').toString('utf8')
    );
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    if (typeof sig !== 'string' || sig.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return null;
    const { email, exp } = JSON.parse(payload);
    if (typeof exp !== 'number' || Date.now() > exp) return null;
    return typeof email === 'string' ? email : null;
  } catch {
    return null;
  }
}

/**
 * GET /api/orders
 * Get orders for authenticated user or by email verification
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = request.nextUrl;
    const email = searchParams.get('email');
    const verificationCode = searchParams.get('code');

    // Case 1: OAuth authenticated user
    if (session?.user?.email) {
      const orders = await prisma.order.findMany({
        where: {
          OR: [
            { userId: session.user.id },
            { email: session.user.email },
          ],
        },
        include: {
          jobs: {
            include: {
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform orders to include image URLs from jobs
      const transformedOrders = orders.map(order => {
        const allImages = order.jobs.flatMap(job => job.images);
        return {
          ...order,
          originalFiles: allImages.map(img => img.originalUrl).filter(Boolean) as string[],
          restoredFiles: allImages.map(img => img.restoredUrl).filter(Boolean) as string[],
        };
      });

      logger.info('Orders retrieved for OAuth user', {
        userId: session.user.id,
        orderCount: transformedOrders.length,
      });

      return NextResponse.json({ orders: transformedOrders });
    }

    // Case 1.5: Guest user with valid signed cookie (same session as checkout)
    const guestToken = request.cookies.get('guestCheckout')?.value ?? '';
    const tokenEmail = extractEmailFromGuestToken(guestToken);
    if (tokenEmail) {
      const orders = await prisma.order.findMany({
        where: { email: tokenEmail },
        include: { jobs: { include: { images: true } } },
        orderBy: { createdAt: 'desc' },
      });
      const transformedOrders = orders.map(order => {
        const allImages = order.jobs.flatMap(job => job.images);
        return {
          ...order,
          originalFiles: allImages.map(img => img.originalUrl).filter(Boolean) as string[],
          restoredFiles: allImages.map(img => img.restoredUrl).filter(Boolean) as string[],
        };
      });
      logger.info('Orders retrieved via guest token', { email: tokenEmail, orderCount: transformedOrders.length });
      return NextResponse.json({ orders: transformedOrders });
    }

    // Case 2: Guest user with email verification
    if (email && verificationCode) {
      const sanitizedEmail = sanitizeEmail(email);

      // Verify the code (stored in session or database)
      const storedCode = request.cookies.get(`verify_${sanitizedEmail}`)?.value;

      if (storedCode !== verificationCode) {
        logger.security('Invalid verification code attempt', {
          email: sanitizedEmail,
          ip: request.ip || 'unknown',
        });
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 401 }
        );
      }

      const orders = await prisma.order.findMany({
        where: { email: sanitizedEmail },
        include: {
          jobs: {
            include: {
              images: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Transform orders to include image URLs from jobs
      const transformedOrders = orders.map(order => {
        const allImages = order.jobs.flatMap(job => job.images);
        return {
          ...order,
          originalFiles: allImages.map(img => img.originalUrl).filter(Boolean) as string[],
          restoredFiles: allImages.map(img => img.restoredUrl).filter(Boolean) as string[],
        };
      });

      logger.info('Orders retrieved for guest user', {
        email: sanitizedEmail,
        orderCount: transformedOrders.length,
      });

      return NextResponse.json({ orders: transformedOrders });
    }

    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  } catch (error) {
    logger.error('Error fetching orders', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
