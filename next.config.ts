import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: ['undici'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/generation/prompts/**/*'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 🔗 URL 兼容层：让 /*.html 自动转发到 /resources/*.html
  // 用户可以直接访问 /profile.html，实际由 /resources/profile.html 提供
  async rewrites() {
    return [
      {
        source: '/:path*.html',
        destination: '/resources/:path*.html',
      },
    ];
  },
  turbopack: {},
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
