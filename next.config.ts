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
  eslint: {
    ignoreDuringBuilds: true,
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
        source: '/xmpgame/v1/status',
        destination: '/api/xmpgame?route=status',
      },
      {
        source: '/xmpgame/v1/tasks',
        destination: '/api/xmpgame?route=tasks',
      },
      {
        source: '/xmpgame',
        destination: '/xmpgame/index.html',
      },
      {
        source: '/xmpgame/',
        destination: '/xmpgame/index.html',
      },
      {
        source: '/xmpgame/station/:path*',
        destination: '/xmpgame/index.html',
      },
      {
        source: '/SNU',
        destination: '/SNU/index.html',
      },
      {
        source: '/SNU/',
        destination: '/SNU/index.html',
      },
      {
        source: '/snu',
        destination: '/SNU/index.html',
      },
      {
        source: '/snu/',
        destination: '/SNU/index.html',
      },
      {
        source: '/korea',
        destination: '/korea/index.html',
      },
      {
        source: '/korea/',
        destination: '/korea/index.html',
      },
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
