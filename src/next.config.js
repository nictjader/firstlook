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
  // This is the direct fix for the cross-origin errors in development.
  // It should be a top-level key, not under 'experimental'.
  experimental: {
    allowedDevOrigins: [
      'https://3001-firebase-studio-1748896253212.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
    ],
  }
};

module.exports = nextConfig;
