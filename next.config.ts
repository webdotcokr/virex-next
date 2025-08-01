import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co', 'via.placeholder.com'],
  },
  assetPrefix: '',
  trailingSlash: false,
};

export default nextConfig;
