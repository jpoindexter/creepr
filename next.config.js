/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    // Exclude puppeteer and other unnecessary browser automation tools
    config.resolve.alias = {
      ...config.resolve.alias,
      'puppeteer/package.json': false,
      'puppeteer': false,
    };

    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        child_process: false,
      };
    }

    return config;
  },
  eslint: {
    // Allow production builds to successfully complete even if there are ESLint warnings
    ignoreDuringBuilds: false,
  },
}

module.exports = nextConfig
