import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: (process.env.IMAGE_HOSTS ?? 'localhost:9000')
      .split(',')
      .filter(Boolean)
      .map((host) => ({
        protocol: host.startsWith('localhost:') ? ('http' as const) : ('https' as const),
        hostname: host.split(':')[0],
        port: host.split(':')[1] ?? '',
        pathname: '/**',
      })),
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  // Redirect /admin to /admin/dashboard
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};

export default nextConfig;
