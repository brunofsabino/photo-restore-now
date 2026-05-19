/**
 * API Route: Issue pre-signed R2 PUT URL
 * POST /api/upload/presign
 *
 * Returns a short-lived signed URL so the browser can upload the file
 * directly to R2 — bypassing Vercel's 4.5 MB request-body limit entirely.
 *
 * Flow:
 *   1. Client POST here → gets { uploadUrl, key, publicUrl }
 *   2. Client PUT file to uploadUrl (goes browser → R2, no Vercel involved)
 *   3. Client stores key/publicUrl for the next step (payment)
 *
 * IMPORTANT: R2 bucket must have CORS configured to allow PUT from the app
 * origin.  Add this in Cloudflare Dashboard → R2 → <bucket> → Settings → CORS:
 *   [{"AllowedOrigins":["https://photorestorenow.com","http://localhost:3000"],
 *     "AllowedMethods":["PUT"],
 *     "AllowedHeaders":["Content-Type"],
 *     "MaxAgeSeconds":300}]
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { STORAGE_PATHS } from '@/lib/constants';
import { logger } from '@/lib/logger';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp']);
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB — enforced via Content-Length hint only

function getR2Client(): S3Client {
  if (
    !process.env.R2_ACCOUNT_ID ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME
  ) {
    throw new Error('R2 not configured');
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });
}

function verifyGuestToken(rawToken: string): boolean {
  try {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret || !rawToken) return false;
    const { payload, sig } = JSON.parse(Buffer.from(rawToken, 'base64').toString('utf8'));
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    if (typeof sig !== 'string' || sig.length !== expected.length) return false;
    if (!crypto.timingSafeEqual(Buffer.from(sig, 'hex'), Buffer.from(expected, 'hex'))) return false;
    const { exp } = JSON.parse(payload);
    return typeof exp === 'number' && Date.now() < exp;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  const guestToken = request.cookies.get('guestCheckout')?.value ?? '';
  if (!session && !verifyGuestToken(guestToken)) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let body: { filename?: string; contentType?: string; size?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { filename = 'photo.jpg', contentType = 'image/jpeg', size = 0 } = body;

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }
  if (size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large (max 30 MB)' }, { status: 400 });
  }

  try {
    const client = getR2Client();
    const randomId = Math.random().toString(36).substring(2, 10);
    const ext = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const key = `${STORAGE_PATHS.ORIGINAL_IMAGES}/${randomId}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME!,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 }); // 5 min
    const publicUrl = `${process.env.R2_PUBLIC_URL}/${key}`;

    logger.info('[Presign] Issued pre-signed PUT URL', { key, contentType });

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (error: any) {
    logger.error('[Presign] Failed to create pre-signed URL', error);
    return NextResponse.json({ error: 'Failed to create upload URL' }, { status: 500 });
  }
}
