/**
 * API Route: Admin Stats
 * GET /api/admin/stats
 * 
 * Returns dashboard statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession();
    
    if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get statistics
    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      completedOrders,
      failedOrders,
      totalRevenue,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'processing' } }),
      prisma.order.count({ where: { status: 'completed' } }),
      prisma.order.count({ where: { status: 'failed' } }),
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { status: { in: ['processing', 'completed'] } },
      }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders,
          failed: failedOrders,
        },
        revenue: {
          total: (totalRevenue._sum.amount || 0) / 100,
          currency: 'USD',
        },
        users: {
          total: totalUsers,
        },
        recentOrders,
      },
    });
  } catch (error) {
    logger.error('Error fetching admin stats', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
