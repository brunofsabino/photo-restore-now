/**
 * API Route: Admin Orders List
 * GET /api/admin/orders
 * 
 * Requires admin authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

// Admin emails - Move to database in production
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      logger.security('Unauthorized admin access attempt', {
        ip: request.ip || 'unknown',
      });
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (!ADMIN_EMAILS.includes(session.user.email)) {
      logger.security('Non-admin user attempted to access admin panel', {
        email: session.user.email,
        ip: request.ip || 'unknown',
      });
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Build query
    const where: any = {};
    if (status) {
      where.status = status;
    }

    // Fetch orders
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip,
      }),
      prisma.order.count({ where }),
    ]);

    logger.info('Admin accessed orders', {
      adminEmail: session.user.email,
      ordersCount: orders.length,
      status,
    });

    return NextResponse.json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
        },
      },
    });
  } catch (error) {
    logger.error('Error fetching admin orders', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
