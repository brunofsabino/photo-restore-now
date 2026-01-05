import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { logger } from '@/lib/logger';
import { sanitizeEmail } from '@/lib/sanitization';

const prisma = new PrismaClient();

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
        orderBy: { createdAt: 'desc' },
      });

      logger.info('Orders retrieved for OAuth user', {
        userId: session.user.id,
        orderCount: orders.length,
      });

      return NextResponse.json({ orders });
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
        orderBy: { createdAt: 'desc' },
      });

      logger.info('Orders retrieved for guest user', {
        email: sanitizedEmail,
        orderCount: orders.length,
      });

      return NextResponse.json({ orders });
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
