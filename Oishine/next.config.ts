import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Konfigurasi untuk production Docker
  output: 'standalone',
  // Konfigurasi untuk development lokal
  experimental: {
    // Enable CORS untuk development
    // Enable Turbopack experimental flag for development
    turbopack: true,
  },
  // Host configuration untuk development
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  // Tambahkan konfigurasi untuk允许 development origins
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    'preview-chat-f1ede0d2-4fb5-4ae1-85da-ed3247b72cb3.space.z.ai'
  ],
};

export default nextConfig;
