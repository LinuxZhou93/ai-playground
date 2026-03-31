import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: [],
  // Standard Turbopack build (Next.js 16 default)
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
};

export default nextConfig;
