/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Ne pas définir X-Frame-Options pour permettre l'embedding
          // Utiliser Content-Security-Policy pour autoriser tous les domaines
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors *", // Autorise l'embedding depuis tous les domaines
          },
        ],
      },
    ];
  },
};

export default nextConfig;
