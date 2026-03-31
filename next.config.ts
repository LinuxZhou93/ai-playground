import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: [],
  // Turbopack disabled via build command (--no-turbopack) in vercel.json
  experimental: {
    proxyClientMaxBodySize: '200mb',
  },
};

export default nextConfig;
