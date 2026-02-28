import { NextRequest, NextResponse } from 'next/server';

/**
 * Image Proxy — downloads images server-side to bypass CORS restrictions.
 * Used by the upload page to reliably download imported product images.
 *
 * GET /api/import/proxy-image?url=<encoded_url>
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB per image

export async function GET(req: NextRequest) {
  const imageUrl = req.nextUrl.searchParams.get('url');

  if (!imageUrl) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Validate URL
  try {
    const parsed = new URL(imageUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return NextResponse.json({ error: 'Invalid URL protocol' }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/*,*/*;q=0.8',
        'Referer': new URL(imageUrl).origin,
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Image fetch failed: ${response.status}` }, { status: 502 });
    }

    const contentType = response.headers.get('content-type')?.split(';')[0] || 'image/jpeg';

    // Validate content type
    if (!ALLOWED_TYPES.some(t => contentType.includes(t))) {
      // Some servers return generic content-type for images — allow if URL ends with image extension
      if (!/\.(jpg|jpeg|png|webp|gif|avif)/i.test(imageUrl)) {
        return NextResponse.json({ error: 'Not an image' }, { status: 400 });
      }
    }

    const buffer = await response.arrayBuffer();

    // Size check
    if (buffer.byteLength > MAX_SIZE) {
      return NextResponse.json({ error: 'Image too large' }, { status: 413 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(buffer.byteLength),
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('timeout') || msg.includes('AbortError')) {
      return NextResponse.json({ error: 'Image download timeout' }, { status: 504 });
    }
    return NextResponse.json({ error: 'Image download failed' }, { status: 502 });
  }
}