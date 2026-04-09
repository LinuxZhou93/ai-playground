import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  transpilePackages: ['mathml2omml', 'pptxgenjs'],
  serverExternalPackages: ['undici'],
  outputFileTracingIncludes: {
    '/api/**/*': ['./lib/generation/prompts/**/*'],
  },
  typescript: {
    ignoreBuildErrors: true,
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
  async rewrites() {
    return [
      {
        source: '/course',
        destination: '/resources/course.html',
      },
      {
        source: '/pricing',
        destination: '/resources/pricing-demo.html',
      },
      {
        source: '/pricing-demo.html',
        destination: '/resources/pricing-demo.html',
      },
      {
        source: '/course-factory',
        destination: '/resources/course-factory.html',
      },
      {
        source: '/resources/course-factory',
        destination: '/resources/course-factory.html',
      },
    ];
  },
};

export default nextConfig;
