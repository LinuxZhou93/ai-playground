import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: [],
  // Disable Turbopack for production builds on Vercel to avoid "Cannot convert rope to string" error
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
  webpack: (config) => {
    return config;
  },
};

export default nextConfig;
