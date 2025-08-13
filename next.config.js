
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
    ],
  },
  allowedDevOrigins: process.env.NODE_ENV === 'production' ? [] : [
    // Allow requests from the Cloud Workstations development environment URL
    process.env.NEXT_PUBLIC_APP_URL_STAGING || '',
  ].filter(Boolean), // Filter out empty strings if the env var isn't set
};

module.exports = nextConfig;
