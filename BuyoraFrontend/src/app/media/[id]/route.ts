export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id))
    return new Response(null, { status: 404 });
  const base = (
    process.env.INTERNAL_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:8080/api/v1'
  ).replace(/\/$/, '');
  try {
    const upstream = await fetch(base + '/media/' + id, {
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
      headers: { cookie: request.headers.get('cookie') ?? '' },
    });
    if (!upstream.ok) return new Response(null, { status: upstream.status === 404 ? 404 : 502 });
    const type = upstream.headers.get('content-type')?.split(';')[0] ?? '';
    if (!['image/png', 'image/jpeg', 'image/webp', 'video/mp4'].includes(type))
      return new Response(null, { status: 502 });
    return new Response(upstream.body, {
      headers: {
        'Content-Type': type,
        'Cache-Control': upstream.headers.get('cache-control') ?? 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response(null, { status: 502 });
  }
}
