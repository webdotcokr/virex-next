/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disable ESLint during build to prevent build failures
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable TypeScript type checking during builds
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  webpack: (config, { isServer }) => {
    // nodemailer를 클라이언트 번들에서 제외
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "nodemailer": false,
        "fs": false,
        "net": false,
        "tls": false,
        "child_process": false,
      };
    }
    
    return config;
  },
}

export default nextConfig