import type { NextConfig } from "next";
import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig: NextConfig = {
  images: {
    domains: ['placehold.co', 'via.placeholder.com'],
  },
  assetPrefix: '',
  trailingSlash: false,
  experimental: {
    reactCompiler: false,
  },
};

export default withPayload(nextConfig);
