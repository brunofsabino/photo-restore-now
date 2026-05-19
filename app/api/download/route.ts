/**
 * API Route: Proxy download for cross-origin R2 files
 * GET /api/download?url=<encoded-r2-url>&filename=restored-photo.jpg
 *
 * The browser `download` attribute only works for same-origin URLs.
 * This route fetches the file server-side and returns it with
 * Content-Disposition: attachment so the browser triggers a save dialog.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const ALLOWED_HOST_SUFFIX = '.r2.dev';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  // Allow guests who came through checkout (or any authenticated user)
  // We still verify the URL is one of our own R2 buckets.
  if (!session) {
    const guestToken = request.cookies.get('guestCheckout')?.value;
    if (!guestToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');
  const filename = searchParams.get('filename') || 'restored-photo.jpg';

  if (!fileUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only proxy our own R2 bucket — reject any other host
  let parsed: URL;
  try {
    parsed = new URL(fileUrl);
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (!parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)) {
    return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
  }

  const upstream = await fetch(fileUrl);
  if (!upstream.ok) {
    return NextResponse.json(
      { error: `Failed to fetch file: ${upstream.status}` },
      { status: 502 }
    );
  }

  const contentType = upstream.headers.get('content-type') || 'image/jpeg';
  const body = await upstream.arrayBuffer();

  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(body.byteLength),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
