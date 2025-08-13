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
    'https://3001-firebase-studio-1748896253212.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
  ].filter(Boolean),
};

module.exports = nextConfig;
