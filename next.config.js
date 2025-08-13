/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    const appUrl = process.env.NODE_ENV === 'production'
      ? process.env.NEXT_PUBLIC_APP_URL_PRODUCTION
      : process.env.NEXT_PUBLIC_APP_URL_STAGING;
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: appUrl || 'http://localhost:3001',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'placehold.co' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  allowedDevOrigins: process.env.NODE_ENV === 'production' ? [] : [
    process.env.NEXT_PUBLIC_APP_URL_STAGING,
  ],
};

module.exports = nextConfig;
