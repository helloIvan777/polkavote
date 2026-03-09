/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable experimental features if needed
  experimental: {
    // Add any experimental features here
  },

  // Environment variables
  env: {
    // Add public environment variables here
    NEXT_PUBLIC_POLKAVOTE_ADDRESS: process.env.NEXT_PUBLIC_POLKAVOTE_ADDRESS || '0xYOUR_CONTRACT_ADDRESS',
  },

  // Images configuration
  images: {
    domains: [],
  },

  // Webpack configuration for ethers.js
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      assert: require.resolve('assert'),
      http: require.resolve('stream-http'),
      https: require.resolve('https-browserify'),
      os: false,
      url: require.resolve('url'),
    };
    return config;
  },
};

module.exports = nextConfig;
