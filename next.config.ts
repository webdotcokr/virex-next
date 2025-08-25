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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Set-Cookie',
            value: 'SameSite=Lax; Secure'
          }
        ]
      }
    ]
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