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
  // 🔗 URL 兼容层：自动转发，让所有页面都能通过短路径访问
  async rewrites() {
    return [
      // /frontend/*.html -> /psyche_x_system/frontend/*.html（脑力测评系统）
      {
        source: '/frontend/:path*',
        destination: '/psyche_x_system/frontend/:path*',
      },
      // /*.html -> /resources/*.html（主站700+页面）
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
