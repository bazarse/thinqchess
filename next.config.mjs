/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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

export default nextConfig;
