import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '/**',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignora ESLint na build
  },
  typescript: {
    ignoreBuildErrors: true, // Ignora erros de TypeScript na build
  },
};

export default nextConfig;
