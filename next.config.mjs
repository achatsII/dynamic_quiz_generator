/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'ALLOWALL', // Allow embedding in iframes
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *", // Allow all origins to embed
          },
        ],
      },
    ];
  },
};

export default nextConfig;
