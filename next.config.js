/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Optional: reduces deployment size

  // Environment variables
  env: {
    NEXT_PUBLIC_POLKAVOTE_ADDRESS: process.env.NEXT_PUBLIC_POLKAVOTE_ADDRESS || '0xYOUR_CONTRACT_ADDRESS',
  },

  // Webpack configuration for ethers.js
  webpack: (config, { isServer }) => {
    // Only apply fallbacks for client-side bundling
    if (!isServer) {
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
    }
    return config;
  },
};

module.exports = nextConfig;
