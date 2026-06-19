/** @type {import('next').NextConfig} */
const nextConfig = {
  // Standalone output for Docker / Cloud Run deployment
  output: 'standalone',
  // Allow loading Leaflet CSS from CDN
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdnjs.cloudflare.com',
      },
    ],
  },
};

export default nextConfig;
