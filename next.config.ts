import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // domains: ['images.unsplash.com', 'avatars.githubusercontent.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
