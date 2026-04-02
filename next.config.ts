import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: ['undici'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {},
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/generation/prompts/**/*'],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Completely exclude undici from client bundle
      config.resolve.alias = {
        ...config.resolve.alias,
        undici: false,
      };

      // Strip node: prefix so fallback can handle Node.js built-in modules
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(/^node:/, (resource: { request: string }) => {
          resource.request = resource.request.replace(/^node:/, '');
        })
      );

      // Provide empty stubs for all Node.js built-in modules on client side
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        net: false,
        tls: false,
        fs: false,
        child_process: false,
        perf_hooks: false,
        diagnostics_channel: false,
        stream: false,
        http: false,
        https: false,
        zlib: false,
        events: false,
        buffer: false,
        util: false,
        url: false,
        assert: false,
        path: false,
        os: false,
        querystring: false,
        async_hooks: false,
        worker_threads: false,
        sqlite: false,
      };
    }
    return config;
  },
};

export default nextConfig;
