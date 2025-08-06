import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  env: {
    GUPSHUP_API_KEY: process.env.GUPSHUP_API_KEY,
    GUPSHUP_APP_NAME: process.env.GUPSHUP_APP_NAME,
  },
};

export default nextConfig;
