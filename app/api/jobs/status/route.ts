/**
 * API Route: Get Job Status
 * GET /api/jobs/status?jobId=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { getJob } from '@/services/job.service';

// Forçar rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_JOB_ID',
            message: 'Job ID is required',
          },
        },
        { status: 400 }
      );
    }

    const job = getJob(jobId);

    if (!job) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'JOB_NOT_FOUND',
            message: 'Job not found',
          },
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        completedAt: job.completedAt,
        errorMessage: job.errorMessage,
        images: job.images.map(img => ({
          id: img.id,
          originalName: img.originalName,
          status: job.status,
          restoredUrl: img.restoredUrl,
        })),
      },
    });
  } catch (error) {
    console.error('Job status error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SERVER_ERROR',
          message: 'Failed to get job status',
        },
      },
      { status: 500 }
    );
  }
}
