/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://6000-firebase-studio-1748896253212.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
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
  allowedDevOrigins: [
    'https://6000-firebase-studio-1748896253212.cluster-lqnxvk7thvfw4wbonsercicksm.cloudworkstations.dev',
  ],
};

module.exports = nextConfig;