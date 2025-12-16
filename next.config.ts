import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true, // ← важно!
    remotePatterns: [
            {
                protocol: 'https',
                hostname: 'false617.beget.tech',
                pathname: '/storage/**',
            },
        ],
  },
};

export default nextConfig;
