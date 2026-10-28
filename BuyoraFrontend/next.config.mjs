const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: (process.env.IMAGE_HOSTS ?? 'localhost:9000')
      .split(',')
      .filter(Boolean)
      .map((host) => ({
        protocol: host.startsWith('localhost:') ? 'http' : 'https',
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
  async redirects() {
    const redirects = [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: false,
      },
    ];
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000');
    if (appUrl.hostname === 'localhost') {
      redirects.unshift({
        source: '/:path*',
        has: [{ type: 'host', value: '127\\.0\\.0\\.1' }],
        destination: `${appUrl.origin}/:path*`,
        permanent: false,
      });
    }
    return redirects;
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
};
export default nextConfig;
