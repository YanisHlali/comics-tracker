const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "drive.usercontent.google.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "yanis-mail.fr",
        port: "",
        pathname: "/cbr/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    deviceSizes: [320, 420, 640, 768, 1024, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  trailingSlash: false,
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./data/**/*'],
      '/api/**/*': ['./data/**/*'],
      '/issue/**/*': ['./data/**/*'],
      '/serie/**/*': ['./data/**/*'],
      '/period/**/*': ['./data/**/*'],
      '/event/**/*': ['./data/**/*'],
    }
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        'fs': 'commonjs fs',
        'path': 'commonjs path'
      });
    }
    return config;
  },
  exportPathMap: async function (defaultPathMap, { dev, dir, outDir, distDir, buildId }) {
    if (dev) {
      return defaultPathMap;
    }
    
    return defaultPathMap;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [];
  },
};

export default nextConfig;