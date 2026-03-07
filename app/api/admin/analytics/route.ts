import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { PrismaClient } from '@prisma/client';
import { logger } from '@/lib/logger';

const prisma = new PrismaClient();

/**
 * GET /api/admin/analytics
 * Returns analytics data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin access
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
    if (!adminEmails.includes(session.user.email)) {
      logger.security('Unauthorized admin access attempt', {
        email: session.user.email,
        ip: request.ip || 'unknown',
      });
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get time range from query params
    const { searchParams } = request.nextUrl;
    const range = searchParams.get('range') || '30d';
    
    const daysAgo = range === '7d' ? 7 : range === '90d' ? 90 : 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Fetch analytics data
    const [orders, jobs] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      }),
      prisma.job.findMany({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),
    ]);

    // Calculate metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
    const totalOrders = orders.length;
    const totalJobs = jobs.length;

    const completedJobs = jobs.filter(j => j.status === 'completed');
    const failedJobs = jobs.filter(j => j.status === 'failed');
    const successRate = totalJobs > 0 ? (completedJobs.length / totalJobs) * 100 : 0;

    // Calculate average processing time (for completed jobs)
    const processingTimes = completedJobs
      .filter(j => j.completedAt && j.createdAt)
      .map(j => j.completedAt!.getTime() - j.createdAt.getTime());
    
    const averageProcessingTime = processingTimes.length > 0
      ? processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length
      : 0;

    // Job stats
    const jobStats = {
      pending: jobs.filter(j => j.status === 'pending').length,
      processing: jobs.filter(j => j.status === 'processing').length,
      completed: completedJobs.length,
      failed: failedJobs.length,
    };

    // Revenue by package
    const revenueByPackage: Record<string, number> = {};
    orders.forEach(order => {
      if (!revenueByPackage[order.packageId]) {
        revenueByPackage[order.packageId] = 0;
      }
      revenueByPackage[order.packageId] += order.amount;
    });

    // Recent orders (top 10)
    const recentOrders = orders.slice(0, 10).map(order => ({
      id: order.id,
      email: order.email,
      amount: order.amount,
      status: order.status,
      photoCount: order.photoCount,
      createdAt: order.createdAt.toISOString(),
    }));

    const analytics = {
      totalRevenue,
      totalOrders,
      totalJobs,
      successRate,
      averageProcessingTime,
      jobStats,
      revenueByPackage,
      recentOrders,
    };

    logger.info('Admin analytics accessed', {
      email: session.user.email,
      range,
    });

    return NextResponse.json(analytics);

  } catch (error) {
    logger.error('Error fetching admin analytics', error as Error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
