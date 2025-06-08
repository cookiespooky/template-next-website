
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'courseplatform.com'],
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_ADMIN_API_URL: process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002/api',
  },
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: `${process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3002'}/uploads/:path*`,
      },
    ]
  },
}

module.exports = nextConfig
