/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration for Turbopack compatibility
  reactStrictMode: true,

  // Simplified image optimization
  images: {
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Minimal experimental features
  experimental: {
    optimizeCss: true,
  },

  // Turbopack configuration (stable)
  turbopack: {
    // Exclude database files from processing
    resolveAlias: {},
  },

  // Webpack configuration to ignore database files
  webpack: (config, { isServer }) => {
    // Ignore database files
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/data/**',
        '**/*.db',
        '**/*.db-shm',
        '**/*.db-wal',
      ],
    };
    return config;
  },

  // Rewrites for subdomain routing
  async rewrites() {
    return [
      {
        source: "/",
        has: [
          {
            type: "host",
            value: "lms.thinqchess.com",
          },
        ],
        destination: "/training",
      },
    ];
  },


};

module.exports = nextConfig;
