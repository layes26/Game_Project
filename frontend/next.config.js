/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com', 'via.placeholder.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Transpile Firebase packages
  transpilePackages: [
    'firebase', 
    '@firebase/auth',
    '@firebase/app',
    '@firebase/component',
    '@firebase/util'
  ],
  // Fix webpack issues with undici
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        http: false,
        https: false,
        dns: false,
        undici: false,
      };
      
      // Completely ignore undici for client build
      config.module.rules.push({
        test: /node_modules[\\/]undici/,
        loader: 'ignore-loader',
      });
    }
    return config;
  },
  // Ignore build errors during development
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;

