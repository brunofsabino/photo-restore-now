/**
 * File Serving API Route
 * 
 * Serves static files from the uploads directory
 * Next.js doesn't serve files outside public/ by default
 */

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Get the file path from the URL
    const filePath = path.join(UPLOADS_DIR, ...params.path);
    
    console.log('[FILE-SERVE] Request path:', params.path);
    console.log('[FILE-SERVE] Full path:', filePath);
    console.log('[FILE-SERVE] File exists:', fs.existsSync(filePath));

    // Security: ensure the path is within uploads directory
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(UPLOADS_DIR)) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 403 }
      );
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // List directory to debug
      const dir = path.dirname(filePath);
      if (fs.existsSync(dir)) {
        const files = fs.readdirSync(dir);
        console.log('[FILE-SERVE] Files in directory:', files);
      }
      return NextResponse.json(
        { error: 'File not found', path: filePath },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);

    // Determine content type based on file extension
    const ext = path.extname(filePath).toLowerCase();
    const contentTypeMap: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Return the file with appropriate headers
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { error: 'Failed to serve file' },
      { status: 500 }
    );
  }
}
