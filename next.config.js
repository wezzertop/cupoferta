/** @type {import('next').NextConfig} */
const nextConfig = {
  // Habilitar standalone output para Docker (Dokploy)
  output: "standalone",

  images: {
    // Dominios permitidos para next/image
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "i.ibb.co",
      },
      {
        protocol: "https",
        hostname: "**.ibb.co",
      },
    ],
  },
};

module.exports = nextConfig;
