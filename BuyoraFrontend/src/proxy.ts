import { NextResponse } from 'next/server';
// Account layouts wait for /auth/me. The API authorizes access to private data.
export function proxy() {
  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
export const config = {
  matcher: [
    '/account/:path*',
    '/admin/:path*',
    '/checkout/:path*',
    '/payment/:path*',
    '/order-confirmation/:path*',
  ],
};
