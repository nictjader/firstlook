/** @type {import('next').NextConfig} */
const nextConfig = {
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
      {
        protocol: 'https',
        hostname: 'accounts.google.com',
      }
    ],
  },

  /*
  webpack: (config, { isServer }) => {
    // Suppress warnings that don't break the build
    config.ignoreWarnings = [
      /require\.extensions is not supported by webpack/,
      /Critical dependency: require function is used in a way/,
    ];
    
    return config;
  },
  */
};

module.exports = nextConfig;
